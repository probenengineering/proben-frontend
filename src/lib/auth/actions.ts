"use server";

import { redirect } from "next/navigation";

import { ApiError, errorMessage, identity, type Challenge, type Tokens } from "./api";
import {
  clearFlow,
  clearSession,
  getAccessToken,
  getFlow,
  saveFlow,
  saveSession,
  type AuthFlow,
} from "./session";

// Server actions behind the sign-in and sign-up screens (implementation.md section 2).
// Each returns { error } to show in a toast, or redirects to the next screen.

export interface AuthResult {
  error?: string;
  /** Where to send the person when the code or verification has expired. */
  restartHref?: string;
  /** Seconds before "Resend Code" can be used again. */
  resendAfter?: number;
  /** Success message; the screen shows it and goes to /sign-in. */
  notice?: string;
}

interface ProviderChoice {
  providerSelectionRequired: true;
  providers: { slug: string; name: string }[];
}

interface Verified {
  verified: true;
  purpose: "signup" | "password_reset";
  verificationToken: string;
}

const DEVICE_NAME = "Proben web";

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

/** Email + password: the backend emails a code, then /verify-email takes over. */
export async function signIn(form: FormData): Promise<AuthResult> {
  let result: Challenge | ProviderChoice;
  try {
    result = await identity("/auth/login", {
      body: {
        email: text(form, "email"),
        password: String(form.get("password") ?? ""),
        deviceName: DEVICE_NAME,
      },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  if ("providerSelectionRequired" in result) {
    return {
      error:
        "This email is linked to more than one organisation. Choosing one isn't available yet.",
    };
  }
  await saveFlow({ purpose: "login", challengeToken: result.challengeToken });
  redirect("/verify-email");
}

/** Invitation sign-up: the backend emails a code, then /verify-email takes over. */
export async function signUp(form: FormData): Promise<AuthResult> {
  const firstName = text(form, "firstName");
  let result: Challenge;
  try {
    result = await identity("/auth/register", {
      body: {
        firstName,
        lastName: text(form, "lastName"),
        email: text(form, "email"),
        inviteCode: text(form, "inviteCode"),
      },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  await saveFlow({ purpose: "signup", challengeToken: result.challengeToken, firstName });
  redirect("/verify-email");
}

/** Forgot password: the backend emails a code (if the account exists), then /verify-email takes over. */
export async function forgotPassword(form: FormData): Promise<AuthResult> {
  let result: Challenge;
  try {
    result = await identity("/auth/password/recovery", { body: { email: text(form, "email") } });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  await saveFlow({ purpose: "password_reset", challengeToken: result.challengeToken });
  redirect("/verify-email");
}

// Where each flow starts, for when its code or verification has expired.
const START: Record<AuthFlow["purpose"], string> = {
  login: "/sign-in",
  signup: "/sign-up",
  password_reset: "/forgot-password",
};

/**
 * Signing in ends here with a session. Signing up and resetting a password continue to
 * /create-password.
 */
export async function verifyCode(code: string): Promise<AuthResult> {
  const flow = await getFlow();
  const restartHref = START[flow?.purpose ?? "login"];
  if (!flow?.challengeToken) return { error: "Your code has expired. Start again.", restartHref };

  let result: Tokens | Verified;
  try {
    result = await identity("/auth/verification/verify", {
      body: { challengeToken: flow.challengeToken, code },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "VERIFICATION_INVALID") {
      return { error: "This code has expired or been used up. Start again.", restartHref };
    }
    return { error: errorMessage(error) };
  }

  if ("accessToken" in result) {
    await saveSession(result);
    await clearFlow();
    redirect("/messages");
  }
  await saveFlow({
    purpose: result.purpose,
    verificationToken: result.verificationToken,
    firstName: flow.firstName,
  });
  redirect("/create-password");
}

export async function resendCode(): Promise<AuthResult> {
  const flow = await getFlow();
  const restartHref = START[flow?.purpose ?? "login"];
  if (!flow?.challengeToken) return { error: "Your code has expired. Start again.", restartHref };
  try {
    const { resendAfter } = await identity<{ resendAfter: number }>("/auth/verification/resend", {
      body: { challengeToken: flow.challengeToken },
    });
    return { resendAfter };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

/**
 * Last step of sign-up (sets the password and signs the person in) and of forgot password
 * (sets the new password; the backend signs out every device, so the person signs in again).
 */
export async function createPassword(form: FormData): Promise<AuthResult> {
  const flow = await getFlow();
  if (!flow?.verificationToken) {
    const restartHref = START[flow?.purpose ?? "signup"];
    return { error: "Your verification has expired. Start again.", restartHref };
  }
  const passwords = {
    verificationToken: flow.verificationToken,
    password: String(form.get("password") ?? ""),
    confirmPassword: String(form.get("confirmPassword") ?? ""),
  };

  if (flow.purpose === "password_reset") {
    try {
      await identity("/auth/password/recovery/reset", { body: passwords });
    } catch (error) {
      return { error: errorMessage(error) };
    }
    await clearSession();
    return { notice: "Your password has been reset. Sign in with your new password." };
  }

  let tokens: Tokens;
  try {
    tokens = await identity("/auth/password/setup", {
      body: { ...passwords, deviceName: DEVICE_NAME },
    });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  await saveSession(tokens);
  await saveFlow({ purpose: "signup", firstName: flow.firstName });
  redirect("/welcome");
}

export async function signOut(): Promise<void> {
  const accessToken = await getAccessToken();
  // Best effort: the local sign-out happens even if the backend can't be reached.
  if (accessToken) await identity("/auth/logout", { method: "POST", accessToken }).catch(() => {});
  await clearSession();
  redirect("/sign-in");
}
