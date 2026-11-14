"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button, Divider, Icon, TextLink } from "@/components/atoms";
import { AuthHeading, FormField, LegalNotice } from "@/components/molecules";
import { useFormComplete } from "@/hooks/useFormComplete";
import { signIn } from "@/lib/auth/actions";
import { showToast } from "@/lib/toast";

// Figma: "Sign in" screen, main column (361px on mobile, 398px on desktop).
// Continue stays grey until email and password are filled, then signs in (POST /auth/login): the
// backend emails a code and /verify-email takes over. Errors show as a toast.
// Continue with Google still goes straight to /messages (Google sign-in isn't wired up yet).
// "Forgot Password?" goes to /forgot-password.
export function SignInForm() {
  const router = useRouter();
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
          const result = await signIn(form);
          if (result?.error) showToast("error", result.error);
        });
      }}
    >
      <AuthHeading
        title="Get started with Proben"
        prompt="You’re new here?"
        linkLabel="Sign up"
        linkHref="/sign-up"
      />

      <Button
        type="button"
        onClick={() => router.push("/messages")}
        variant="outline"
        icon={<Icon name="google" />}
        className="w-full"
      >
        Continue with Google
      </Button>

      <Divider label="or" />

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

      <FormField
        id="password"
        name="password"
        label="Enter your password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Placeholder"
        iconRight={<Icon name="lock" />}
        below={
          <TextLink href="/forgot-password" className="type-paragraph-sm">
            Forgot Password?
          </TextLink>
        }
      />

      <Button type="submit" disabled={!complete || pending} className="w-full">
        Continue
      </Button>

      {/* Figma: 265px wide on mobile (wraps to 2 lines), full column width on desktop */}
      <LegalNotice action="signing in" className="mx-auto max-w-66.25 md:max-w-none" />
    </form>
  );
}
