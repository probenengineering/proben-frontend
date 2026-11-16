import { getDashboardOverview } from "@/lib/dashboard";

import { ClockCard } from "./ClockCard";
import { OpenShifts } from "./OpenShifts";
import { TodaySchedule } from "./TodaySchedule";

// Home "Overview" main column: My time, Today's schedule, Open Shifts. Reads the session, so
// render it inside <Suspense>. Empty data shows the empty state (Figma 51:10133).
export async function HomeOverview() {
  const { shift, schedule, openShifts, openShiftsAvailable } = await getDashboardOverview();
  return (
    <>
      <ClockCard shift={shift} />
      <TodaySchedule items={schedule} />
      <OpenShifts items={openShifts} available={openShiftsAvailable} />
    </>
  );
}
