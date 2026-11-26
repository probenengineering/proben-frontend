import type { Metadata } from "next";

import { DashboardHeader, DashboardTabs, HomeAside, RecentChatsDock } from "@/components/organisms";
import { HomeOverview } from "@/components/organisms/HomeOverview";
import { DashboardTemplate } from "@/components/templates";
import { DASHBOARD_TABS, QUICK_ACTIONS } from "@/lib/sample-dashboard";

// Moving here from another page waits for this page's data, keeping the current page on screen
// (with the progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Home | Proben",
};

export default function HomePage() {
  return (
    <DashboardTemplate
      header={<DashboardHeader />}
      tabs={<DashboardTabs tabs={DASHBOARD_TABS} />}
      aside={<HomeAside actions={QUICK_ACTIONS} />}
      dock={<RecentChatsDock />}
    >
      <HomeOverview />
    </DashboardTemplate>
  );
}
