import { NextResponse, type NextRequest } from "next/server";

import { ApiError, identity, type Tokens } from "@/lib/auth/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, tokenCookies } from "@/lib/auth/cookies";

// Keeps the session alive: when the access cookie has lapsed (60s before the token expires) but a
// refresh token is there, get a new pair before the page or action runs.
// Refresh tokens are single-use (reusing one ends the session), so requests that arrive together
// with the same token share one refresh call.
const refreshing = new Map<string, Promise<Tokens | "ended" | undefined>>();

function refresh(refreshToken: string) {
  let pending = refreshing.get(refreshToken);
  if (!pending) {
    pending = identity<Tokens>("/auth/refresh", { body: { refreshToken } }).catch((error) =>
      // 400/401: the session is over. Anything else (offline, 5xx): try again on the next request.
      error instanceof ApiError && (error.status === 400 || error.status === 401)
        ? "ended"
        : undefined,
    );
    refreshing.set(refreshToken, pending);
    // Keep the result briefly for requests still carrying the old token.
    setTimeout(() => refreshing.delete(refreshToken), 30_000);
  }
  return pending;
}

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken || request.cookies.has(ACCESS_COOKIE)) return NextResponse.next();

  const result = await refresh(refreshToken);
  if (!result) return NextResponse.next();

  if (result === "ended") {
    request.cookies.delete(REFRESH_COOKIE);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  // Pass the new tokens to this request's page or action, and store them in the browser.
  const cookies = tokenCookies(result);
  for (const cookie of cookies) request.cookies.set(cookie.name, cookie.value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  for (const cookie of cookies) response.cookies.set(cookie);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)"],
};
