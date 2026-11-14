"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button, textLinkVariants } from "@/components/atoms";
import { AuthHeading } from "@/components/molecules";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

// Figma: "Welcome" screen shown after sign-up (361px on mobile, 398px on desktop).
// Continue goes to /messages; Sign out ends the session (POST /auth/logout) and goes to /sign-in.
export interface WelcomePanelProps {
  /** Name in the greeting, e.g. "Ozenua". Left out when unknown. */
  name?: string;
}

export function WelcomePanel({ name }: WelcomePanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex w-full flex-col items-center gap-10">
      <AuthHeading
        title={name ? `Welcome to ProBen, ${name}` : "Welcome to ProBen"}
        prompt="You can now access your workspace and get started with your assigned tools and tasks."
        promptClassName="type-paragraph-md"
      />

      <Button type="button" className="w-full" onClick={() => router.push("/messages")}>
        Continue
      </Button>

      <p className="flex justify-center gap-3 type-title-sm text-black-50">
        Try another account?
        <button
          type="button"
          disabled={pending}
          className={cn(textLinkVariants.brand, "cursor-pointer disabled:cursor-default")}
          onClick={() => startTransition(() => signOut())}
        >
          Sign out
        </button>
      </p>
    </div>
  );
}
