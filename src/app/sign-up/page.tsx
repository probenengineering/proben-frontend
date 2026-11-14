import type { Metadata } from "next";
import { Suspense } from "react";

import { AppPreview, SignUpForm } from "@/components/organisms";
import { LogoColumnTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "Create account | Proben",
};

type SearchParams = Promise<{ invite?: string | string[] }>;

// The invitation email links here as /sign-up?invite=<code> (or via /invite?token=<code>).
// The form is prerendered with a typed invite code field; the invite from the URL is read at
// request time and streamed in.
export default function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <LogoColumnTemplate preview={<AppPreview />} raiseOnMobile>
      <Suspense fallback={<SignUpForm />}>
        <SignUpFormWithInvite searchParams={searchParams} />
      </Suspense>
    </LogoColumnTemplate>
  );
}

async function SignUpFormWithInvite({ searchParams }: { searchParams: SearchParams }) {
  const { invite } = await searchParams;
  const inviteCode = (Array.isArray(invite) ? invite[0] : invite)?.trim() || undefined;
  return <SignUpForm inviteCode={inviteCode} />;
}
