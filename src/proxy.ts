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

// Where a signed-in person lands when they open an auth screen.
const APP_HOME = "/";

// Screens a signed-out person may open: the auth flow. Everything else needs a session.
const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/create-password",
  "/forgot-password",
  "/invite",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Signed out: pages go to sign-in, API routes get a 401. */
function signedOut(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/sign-in", request.url));
}

/**
 * Signed in: opening an auth screen goes straight to the app. Only page loads (GET) are
 * redirected; server actions posted from those screens still run.
 */
function shouldSkipAuthScreen(request: NextRequest) {
  return request.method === "GET" && isPublic(request.nextUrl.pathname);
}

export async function proxy(request: NextRequest) {
  // An optimistic check on the cookies only. Pages and API calls still send the token to the
  // backend, which rejects a bad one (the data layer then redirects to /sign-in).
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (request.cookies.has(ACCESS_COOKIE)) {
    return shouldSkipAuthScreen(request)
      ? NextResponse.redirect(new URL(APP_HOME, request.url))
      : NextResponse.next();
  }
  if (!refreshToken) return signedOut(request);

  const result = await refresh(refreshToken);
  // Offline or a backend error: let the request through; the refresh is retried next time.
  if (!result) return NextResponse.next();

  if (result === "ended") {
    request.cookies.delete(REFRESH_COOKIE);
    const response = signedOut(request);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  // Pass the new tokens to this request's page or action, and store them in the browser.
  const cookies = tokenCookies(result);
  for (const cookie of cookies) request.cookies.set(cookie.name, cookie.value);
  const response = shouldSkipAuthScreen(request)
    ? NextResponse.redirect(new URL(APP_HOME, request.url))
    : NextResponse.next({ request: { headers: request.headers } });
  for (const cookie of cookies) response.cookies.set(cookie);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)"],
};
