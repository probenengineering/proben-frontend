import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/organisms";
import { AuthTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "Forgot password | Proben",
};

export default function ForgotPasswordPage() {
  return (
    <AuthTemplate>
      <ForgotPasswordForm />
    </AuthTemplate>
  );
}
