"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { textLinkVariants } from "@/components/atoms";
import { AuthHeading, OtpInput } from "@/components/molecules";
import { resendCode, verifyCode, type AuthResult } from "@/lib/auth/actions";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

// Figma: "Verify email with code" screen, main column (361px on mobile, 398px on desktop).
// Used by both sign-in and sign-up. Entering all 6 characters checks the code
// (POST /auth/verification/verify): sign-in continues to /messages, sign-up to /create-password.
// "Resend Code" asks for a new code, then waits the backend's resendAfter seconds.
// Errors show as a toast; an expired code sends the person back to where they started.
export function VerifyEmailForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!secondsLeft) return;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Shows the error, if any. Returns true when there was one.
  function showError(result: AuthResult | undefined) {
    if (!result?.error) return false;
    showToast("error", result.error);
    if (result.restartHref) router.push(result.restartHref);
    return true;
  }

  return (
    <form className="flex w-full flex-col items-center gap-6">
      <AuthHeading
        title="Verify your email"
        prompt="A verification code has been sent to your email address"
      />

      <OtpInput
        aria-label="Verification code"
        onComplete={(code) => startTransition(async () => void showError(await verifyCode(code)))}
      />

      <p className="text-center type-title-md text-black-50">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          disabled={pending || secondsLeft > 0}
          className={cn(textLinkVariants.underline, "cursor-pointer disabled:cursor-default")}
          onClick={() =>
            startTransition(async () => {
              const result = await resendCode();
              if (showError(result)) return;
              showToast("success", "We've sent you a new code.");
              setSecondsLeft(result.resendAfter ?? 60);
            })
          }
        >
          {secondsLeft ? `Resend Code (${secondsLeft}s)` : "Resend Code"}
        </button>
      </p>

      {/* Figma "Caption/Regular" here is Inter Tight with 4% spacing, unlike the caption-sm token (one-off, as agreed). */}
      <p className="text-center type-caption-sm font-sans! tracking-[0.04em]! text-black-60 capitalize">
        For security, your code expires after 10 minutes.
      </p>
    </form>
  );
}
