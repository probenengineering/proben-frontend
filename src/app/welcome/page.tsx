import type { Metadata } from "next";
import { Suspense } from "react";

import { WelcomePanel } from "@/components/organisms";
import { LogoColumnTemplate } from "@/components/templates";
import { getFlow } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Welcome | Proben",
};

// The first name typed on sign-up is read from the session cookie at request time and streamed in.
export default function WelcomePage() {
  return (
    <LogoColumnTemplate>
      <Suspense fallback={<WelcomePanel />}>
        <WelcomeWithName />
      </Suspense>
    </LogoColumnTemplate>
  );
}

async function WelcomeWithName() {
  const flow = await getFlow();
  return <WelcomePanel name={flow?.firstName} />;
}
