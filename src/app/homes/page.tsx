import type { Metadata } from "next";
import { Suspense } from "react";

import { AssignedHomes } from "@/components/organisms/AssignedHomes";
import { AppShell } from "@/components/templates";

export const metadata: Metadata = {
  title: "My Homes | Proben",
};

export default function HomesListPage({
  searchParams,
}: {
  searchParams: Promise<{ home?: string | string[] }>;
}) {
  return (
    <AppShell variant="flat">
      <Suspense>
        <AssignedHomes searchParams={searchParams} />
      </Suspense>
    </AppShell>
  );
}
