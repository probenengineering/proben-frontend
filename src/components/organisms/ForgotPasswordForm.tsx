"use client";

import { useTransition } from "react";

import { Button, Icon, TextLink } from "@/components/atoms";
import { AuthHeading, FormField } from "@/components/molecules";
import { useFormComplete } from "@/hooks/useFormComplete";
import { forgotPassword } from "@/lib/auth/actions";
import { showToast } from "@/lib/toast";

// No Figma frame yet: built from the sign-in screen's parts (CLAUDE.md exception for auth screens).
// Sends a reset code (POST /auth/password/recovery), then reuses /verify-email and
// /create-password. The backend replies the same way whether or not the email has an account.
export function ForgotPasswordForm() {
  const { complete, onInput } = useFormComplete();
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="flex w-full flex-col gap-6"
      onInput={onInput}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await forgotPassword(form);
          if (result?.error) showToast("error", result.error);
        });
      }}
    >
      <AuthHeading
        title="Forgot your password?"
        prompt="Enter your email and we'll send you a code to reset it"
      />

      <FormField
        id="email"
        name="email"
        label="Enter your email"
        type="email"
        autoComplete="email"
        required
        placeholder="Placeholder"
        iconRight={<Icon name="mail" />}
      />

      <Button type="submit" disabled={!complete || pending} className="w-full">
        Send code
      </Button>

      <p className="flex justify-center gap-1 type-title-sm text-black-60">
        Remembered it?
        <TextLink variant="brand" href="/sign-in">
          Sign in
        </TextLink>
      </p>
    </form>
  );
}
