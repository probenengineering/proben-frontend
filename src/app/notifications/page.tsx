import type { Metadata } from "next";
import { Suspense } from "react";

import { NotificationsView } from "@/components/organisms/NotificationsView";
import { AppShell } from "@/components/templates";

export const metadata: Metadata = {
  title: "Notifications | Proben",
};

export default function NotificationsPage() {
  return (
    <AppShell variant="flat" activeNav="notifications">
      <Suspense>
        <NotificationsView />
      </Suspense>
    </AppShell>
  );
}
