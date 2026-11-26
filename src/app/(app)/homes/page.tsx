import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AssignedHomes,
  DashboardHeader,
  DashboardTabs,
  HomesSkeleton,
} from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

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
      <Suspense fallback={<HomesSkeleton />}>
        <AssignedHomes searchParams={searchParams} />
      </Suspense>
    </TasksTemplate>
  );
}
