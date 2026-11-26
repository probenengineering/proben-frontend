import type { IconName } from "@/components/atoms";
import { getDashboardOverview } from "@/lib/dashboard";
import { getDashboardAside } from "@/lib/dashboard-aside";

import { DashboardAside } from "./DashboardAside";
import { OpenShifts } from "./OpenShifts";

// Home right column with live homes, Needs Attention tasks and (v2) Open Shifts. Reads the
// session, so render it inside <Suspense> (the fallback can be DashboardAside with empty lists).
// The overview request is cached per request and shared with the main column.
export interface HomeAsideProps {
  actions: { icon: IconName; label: string; href?: string }[];
}

export async function HomeAside({ actions }: HomeAsideProps) {
  const [{ homes, tasks }, { openShifts, openShiftsAvailable }] = await Promise.all([
    getDashboardAside(),
    getDashboardOverview(),
  ]);
  return (
    <DashboardAside
      actions={actions}
      homes={homes}
      tasks={tasks}
      openShifts={<OpenShifts items={openShifts} available={openShiftsAvailable} />}
    />
  );
}
