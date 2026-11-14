"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button, Icon } from "@/components/atoms";
import { AuthHeading, FormField } from "@/components/molecules";
import { useFormComplete } from "@/hooks/useFormComplete";
import { createPassword } from "@/lib/auth/actions";
import { showToast } from "@/lib/toast";

// Backend rule (WEAK_PASSWORD otherwise): at least 10 characters, at most 72 bytes.
const MIN_LENGTH = 10;
const MAX_BYTES = 72;

function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters.`;
  if (new TextEncoder().encode(password).length > MAX_BYTES) return "This password is too long.";
  if (password !== confirm) return "Passwords don't match.";
  return null;
}

// Figma: "Create new password" screen, main column (361px on mobile, 398px on desktop).
// Agreed changes from the frame: logo shown and content centred like the other auth screens,
// padlock icons instead of the envelope.
// Sign-up and forgot password both reach this screen after the emailed code is verified.
// Sign-up: POST /auth/password/setup signs the person in and continues to /welcome.
// Forgot password: POST /auth/password/recovery/reset signs out every device, so a success toast
// shows and the person goes to /sign-in. The button stays grey until both fields are filled; on
// submit it checks the backend's rules first. Problems (including WEAK_PASSWORD) show under the
// confirm field.
export function CreatePasswordForm() {
  const router = useRouter();
  const { complete, onInput } = useFormComplete();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="flex w-full flex-col gap-6"
      onInput={(event) => {
        onInput(event);
        setError(null);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const problem = passwordProblem(
          String(form.get("password") ?? ""),
          String(form.get("confirmPassword") ?? ""),
        );
        if (problem) return setError(problem);
        startTransition(async () => {
          const result = await createPassword(form);
          if (result?.notice) {
            showToast("success", result.notice);
            router.push("/sign-in");
            return;
          }
          if (!result?.error) return;
          if (result.restartHref) {
            showToast("error", result.error);
            router.push(result.restartHref);
          } else {
            setError(result.error);
          }
        });
      }}
    >
      <AuthHeading
        title="Create a new password"
        prompt="Your email has been verified. Create a new password to secure your account."
        promptClassName="max-w-77.5"
      />

      <FormField
        id="new-password"
        name="password"
        label="Enter your password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="••••••••"
        iconRight={<Icon name="lock" />}
      />

      <FormField
        id="confirm-password"
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="••••••••"
        iconRight={<Icon name="lock" />}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "password-error" : undefined}
        below={
          error && (
            <p id="password-error" role="alert" className="type-paragraph-sm text-error-500">
              {error}
            </p>
          )
        }
      />

      <Button type="submit" disabled={!complete || pending} className="w-full">
        Create new password
      </Button>
    </form>
  );
}
