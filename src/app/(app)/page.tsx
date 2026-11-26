import type { Metadata } from "next";
import { Suspense } from "react";

import {
  ContentSkeleton,
  DashboardAside,
  DashboardHeader,
  DashboardTabs,
  HomeAside,
  RecentChatsDock,
} from "@/components/organisms";
import { HomeOverview } from "@/components/organisms/HomeOverview";
import { DashboardTemplate } from "@/components/templates";
import { DASHBOARD_TABS, QUICK_ACTIONS } from "@/lib/sample-dashboard";

export const metadata: Metadata = {
  title: "Home | Proben",
};

export default function HomePage() {
  return (
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
      <Suspense fallback={<ContentSkeleton label="Loading your day" hero rows={4} />}>
        <HomeOverview />
      </Suspense>
    </DashboardTemplate>
  );
}
