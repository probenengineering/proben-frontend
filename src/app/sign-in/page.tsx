import type { Metadata } from "next";

import { SignInForm } from "@/components/organisms";
import { AuthTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "Sign in | Proben",
};

export default function SignInPage() {
  return (
    <AuthTemplate>
      <SignInForm />
    </AuthTemplate>
  );
}
