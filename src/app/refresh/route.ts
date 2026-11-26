import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_COOKIE, cookieOptions, tokenCookies } from "@/lib/auth/cookies";
import { refreshTokens } from "@/lib/auth/refresh";
import { clearSession } from "@/lib/auth/session";

// Where a page goes when the backend calls the access token stale (roles or homes changed) or
// expired: swap it for a fresh one and go back to the page, so the person isn't signed out.
// A second stale answer within 30 seconds signs out instead of looping.
const RETRIED = "proben_refreshed";

/** The page to return to: the referring page on this site, else Home. */
function backTo(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (referer) {
    const url = new URL(referer);
    if (url.origin === request.nextUrl.origin && url.pathname !== "/refresh") return url;
  }
  return new URL("/", request.url);
}

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const result =
    refreshToken && !request.cookies.has(RETRIED) ? await refreshTokens(refreshToken) : "ended";

  if (result === "ended") {
    await clearSession();
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  const response = NextResponse.redirect(backTo(request));
  response.cookies.set({ name: RETRIED, value: "1", ...cookieOptions, maxAge: 30 });
  // Offline or a backend error: go back without new tokens; the next stale answer signs out.
  if (result) for (const cookie of tokenCookies(result)) response.cookies.set(cookie);
  return response;
}
