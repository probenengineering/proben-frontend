import type { Metadata } from "next";

import { CreatePasswordForm } from "@/components/organisms";
import { AuthTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "Create new password | Proben",
};

export default function CreatePasswordPage() {
  return (
    <AuthTemplate>
      <CreatePasswordForm />
    </AuthTemplate>
  );
}
