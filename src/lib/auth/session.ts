import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, request, type RequestOptions, type Tokens } from "./api";
import {
  ACCESS_COOKIE,
  FLOW_COOKIE,
  FLOW_MAX_AGE,
  REFRESH_COOKIE,
  cookieOptions,
  tokenCookies,
} from "./cookies";
import { refreshTokens } from "./refresh";

// Reading works anywhere on the server; writing only in server actions and route handlers.

export interface AuthFlow {
  purpose: "login" | "signup" | "password_reset";
  /** From /auth/login or /auth/register, used to verify or resend the emailed code. */
  challengeToken?: string;
  /** From verifying a sign-up code, used to set the password. */
  verificationToken?: string;
  /** Typed on the sign-up form, shown on the welcome screen. */
  firstName?: string;
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function saveSession(tokens: Tokens) {
  const jar = await cookies();
  for (const cookie of tokenCookies(tokens)) jar.set(cookie);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(FLOW_COOKIE);
}

/**
 * The backend rejected the session (401). Goes through /refresh (stale or expired token) or
 * /sign-out, which clears the cookies;
 * a plain redirect to /sign-in would loop, as the proxy sends signed-in people back to the app.
 */
export function sessionEnded(error?: unknown): never {
  // The token is still valid by time but out of date (roles or homes changed, TOKEN_STALE) or
  // just expired: /refresh swaps it for a new one and comes back. Anything else signs out.
  const code = (error as { code?: string } | undefined)?.code;
  redirect(code === "TOKEN_STALE" || code === "TOKEN_EXPIRED" ? "/refresh" : "/sign-out");
}

export async function getFlow(): Promise<AuthFlow | undefined> {
  const value = (await cookies()).get(FLOW_COOKIE)?.value;
  if (!value) return undefined;
  try {
    return JSON.parse(value) as AuthFlow;
  } catch {
    return undefined;
  }
}

export async function clearFlow() {
  (await cookies()).delete(FLOW_COOKIE);
}

export async function saveFlow(flow: AuthFlow) {
  (await cookies()).set({
    name: FLOW_COOKIE,
    value: JSON.stringify(flow),
    ...cookieOptions,
    maxAge: FLOW_MAX_AGE,
  });
}

const isStale = (error: unknown) =>
  error instanceof ApiError &&
  error.status === 401 &&
  (error.code === "TOKEN_STALE" || error.code === "TOKEN_EXPIRED");

/**
 * In a server action or route handler, swaps the refresh token for a new pair and stores it.
 * Returns the new access token, or undefined where cookies can't be written (a page render: the
 * page redirects to /refresh instead, so the single-use refresh token isn't spent and lost).
 */
async function refreshInPlace() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return undefined;
  try {
    jar.delete("proben_probe"); // throws while rendering a page
  } catch {
    return undefined;
  }
  const result = await refreshTokens(refreshToken);
  if (!result || result === "ended") return undefined;
  await saveSession(result);
  return result.accessToken;
}

/**
 * A backend call as the signed-in person. If the token is stale (roles or homes changed) and this
 * is a server action, it's refreshed and the call retried once, so the person's action still
 * goes through; on a page the 401 is thrown and the page redirects to /refresh.
 */
export async function authedRequest<T>(
  path: string,
  options: Omit<RequestOptions, "accessToken"> = {},
): Promise<T> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new ApiError(401, "UNAUTHENTICATED", "Your session has ended. Sign in again.");
  }
  try {
    return await request<T>(path, { ...options, accessToken });
  } catch (error) {
    const fresh = isStale(error) ? await refreshInPlace() : undefined;
    if (!fresh) throw error;
    return request<T>(path, { ...options, accessToken: fresh });
  }
}
