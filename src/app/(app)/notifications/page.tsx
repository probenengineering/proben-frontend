import type { Metadata } from "next";

import { NotificationsView } from "@/components/organisms/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications | Proben",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
