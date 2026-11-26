import type { Metadata } from "next";
import { Suspense } from "react";

import {
  DashboardAside,
  DashboardHeader,
  HomeAside,
  DashboardTabs,
  RecentChatsDock,
} from "@/components/organisms";
import { HomeOverview } from "@/components/organisms/HomeOverview";
import { AppShell, DashboardTemplate } from "@/components/templates";
import { DASHBOARD_TABS, QUICK_ACTIONS } from "@/lib/sample-dashboard";

export const metadata: Metadata = {
  title: "Home | Proben",
};

export default function HomePage() {
  return (
    <AppShell>
      <DashboardTemplate
        header={<DashboardHeader />}
        tabs={<DashboardTabs tabs={DASHBOARD_TABS} />}
        aside={
          <Suspense fallback={<DashboardAside actions={QUICK_ACTIONS} homes={[]} tasks={[]} />}>
            <HomeAside actions={QUICK_ACTIONS} />
          </Suspense>
        }
        dock={<RecentChatsDock />}
      >
        <Suspense>
          <HomeOverview />
        </Suspense>
      </DashboardTemplate>
    </AppShell>
  );
}
