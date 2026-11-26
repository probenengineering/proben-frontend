import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Tokens } from "./api";
import {
  ACCESS_COOKIE,
  FLOW_COOKIE,
  FLOW_MAX_AGE,
  REFRESH_COOKIE,
  cookieOptions,
  tokenCookies,
} from "./cookies";

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
 * The backend rejected the session (401). Goes through /sign-out, which clears the cookies;
 * a plain redirect to /sign-in would loop, as the proxy sends signed-in people back to the app.
 */
export function sessionEnded(): never {
  redirect("/sign-out");
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
