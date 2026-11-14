import type { Metadata } from "next";

import { VerifyEmailForm } from "@/components/organisms";
import { AuthTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "Verify email | Proben",
};

export default function VerifyEmailPage() {
  return (
    <AuthTemplate>
      <VerifyEmailForm />
    </AuthTemplate>
  );
}
