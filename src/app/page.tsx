import type { Metadata } from "next";
import { Suspense } from "react";

import {
  DashboardAside,
  DashboardHeader,
  DashboardTabs,
  RecentChatsDock,
} from "@/components/organisms";
import { HomeOverview } from "@/components/organisms/HomeOverview";
import { AppShell, DashboardTemplate } from "@/components/templates";
import { DASHBOARD_TABS, QUICK_ACTIONS, TASKS } from "@/lib/sample-dashboard";

export const metadata: Metadata = {
  title: "Home | Proben",
};

export default function HomePage() {
  return (
    <AppShell>
      <DashboardTemplate
        header={<DashboardHeader greeting="Good morning, Alision" />}
        tabs={<DashboardTabs tabs={DASHBOARD_TABS} />}
        aside={<DashboardAside actions={QUICK_ACTIONS} tasks={TASKS} />}
        dock={<RecentChatsDock />}
      >
        <Suspense>
          <HomeOverview />
        </Suspense>
      </DashboardTemplate>
    </AppShell>
  );
}
