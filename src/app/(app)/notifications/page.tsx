import type { Metadata } from "next";

import { NotificationsView } from "@/components/organisms/NotificationsView";

// Moving here from another page waits for this page's data, keeping the current page on screen
// (with the progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Notifications | Proben",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
