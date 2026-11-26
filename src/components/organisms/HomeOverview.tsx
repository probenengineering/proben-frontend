import { getDashboardOverview } from "@/lib/dashboard";

import { ClockCard } from "./ClockCard";
import { TodaySchedule } from "./TodaySchedule";

// Home "Overview" main column (v2, Figma 60:9785): My time, then Today's schedule. Open Shifts
// moved to the right column (HomeAside). Reads the session, so render it inside <Suspense>.
export async function HomeOverview() {
  const { shift, attendance, nextShift, schedule, openShiftsAvailable } =
    await getDashboardOverview();
  return (
    <>
      <ClockCard
        shift={shift}
        attendance={attendance}
        openShiftsAvailable={openShiftsAvailable}
        nextShift={nextShift}
      />
      {schedule && <TodaySchedule {...schedule} />}
    </>
  );
}
