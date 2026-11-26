import type { Metadata } from "next";

import { AssignedHomes, DashboardHeader, DashboardTabs } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

// Moving here from another page waits for this page's data, keeping the current page on screen
// (with the progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "My Homes | Proben",
};

// My homes (Figma 60:12810; loading 60:13068).
export default function HomesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  return (
    <TasksTemplate
      header={<DashboardHeader />}
      tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="My Homes" />}
    >
      <AssignedHomes searchParams={searchParams} />
    </TasksTemplate>
  );
}
