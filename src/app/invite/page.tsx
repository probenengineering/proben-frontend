import { redirect } from "next/navigation";
import { Suspense } from "react";

type SearchParams = Promise<{ token?: string | string[] }>;

// The backend's invitation email links to APP_URL/invite?token=<invite code>.
// Send people on to sign-up with the code filled in. The token is read at request time.
export default function InvitePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense>
      <RedirectToSignUp searchParams={searchParams} />
    </Suspense>
  );
}

// redirect() always throws, so this never renders anything.
async function RedirectToSignUp({ searchParams }: { searchParams: SearchParams }): Promise<null> {
  const { token } = await searchParams;
  const code = (Array.isArray(token) ? token[0] : token)?.trim();
  redirect(code ? `/sign-up?invite=${encodeURIComponent(code)}` : "/sign-up");
}
