"use client";

import { useTransition } from "react";

import { Button } from "@/components/atoms";
import { AuthHeading, FormField, LegalNotice } from "@/components/molecules";
import { useFormComplete } from "@/hooks/useFormComplete";
import { signUp } from "@/lib/auth/actions";
import { showToast } from "@/lib/toast";

// Figma: "Create account" screen, form column (361px on mobile, 398px on desktop).
// Continue stays grey until the required fields are filled, then starts sign-up
// (POST /auth/register): the backend emails a code and /verify-email takes over. Errors show as
// a toast. The password is chosen after the code is verified (/create-password).
// Opened from the invitation email (/sign-up?invite=…), the invite code is filled in and the
// field is hidden; otherwise people type it.
export interface SignUpFormProps {
  /** Invite code from the invitation link. */
  inviteCode?: string;
}

export function SignUpForm({ inviteCode }: SignUpFormProps) {
  const { complete, onInput } = useFormComplete();
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="flex w-full flex-col gap-10"
      onInput={onInput}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await signUp(form);
          if (result?.error) showToast("error", result.error);
        });
      }}
    >
      <AuthHeading
        title="Get started with Proben"
        prompt="Enter your account information to get started"
      />

      <div className="flex flex-col gap-6">
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <FormField
              id="first-name"
              name="firstName"
              label="First name"
              autoComplete="given-name"
              required
              placeholder="Placeholder"
            />
          </div>
          <div className="min-w-0 flex-1">
            <FormField
              id="last-name"
              name="lastName"
              label="Last name"
              autoComplete="family-name"
              required
              placeholder="Placeholder"
            />
          </div>
        </div>

        <FormField
          id="email"
          name="email"
          label="Enter your email"
          type="email"
          autoComplete="email"
          required
          placeholder="Placeholder"
        />

        {inviteCode ? (
          <input type="hidden" id="invite-code" name="inviteCode" value={inviteCode} />
        ) : (
          <FormField
            id="invite-code"
            name="inviteCode"
            label="Invite code"
            autoComplete="off"
            required
            placeholder="Placeholder"
          />
        )}

        <Button type="submit" disabled={!complete || pending} className="w-full">
          Continue
        </Button>

        <LegalNotice action="signing up" className="mx-auto max-w-75.5" />
      </div>
    </form>
  );
}
