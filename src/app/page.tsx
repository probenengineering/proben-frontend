import type { Metadata } from "next";

import {
  ClockCard,
  DashboardAside,
  DashboardHeader,
  DashboardTabs,
  OpenShifts,
  RecentChatsDock,
  TodaySchedule,
} from "@/components/organisms";
import { AppShell, DashboardTemplate } from "@/components/templates";
import {
  DASHBOARD_TABS,
  OPEN_SHIFTS,
  QUICK_ACTIONS,
  SCHEDULE,
  TASKS,
} from "@/lib/sample-dashboard";

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
        <ClockCard />
        <TodaySchedule items={SCHEDULE} />
        <OpenShifts items={OPEN_SHIFTS} available={3} />
      </DashboardTemplate>
    </AppShell>
  );
}
