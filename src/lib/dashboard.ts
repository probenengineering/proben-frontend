import "server-only";

import type { OpenShiftItemProps, ScheduleItemProps } from "@/components/molecules";
import { getCurrentUser } from "@/lib/auth/user";
import { OPEN_SHIFTS, SCHEDULE, SHIFT } from "@/lib/sample-dashboard";
import type { ScheduledShift } from "@/lib/shift-clock/types";

// Data for the Home "Overview" tab. TEMPORARY: returns Figma sample data when signed in and the
// empty state (Figma 51:10133) when not. Swap point for the API in docs/command-center.md §2.

export interface DashboardOverview {
  /** Today's shift the clock runs against; null = no shift today. */
  shift: ScheduledShift | null;
  schedule: Omit<ScheduleItemProps, "first">[];
  /** The open shifts shown on Home (a preview). */
  openShifts: OpenShiftItemProps[];
  /** Total open shifts available, for the "N available" pill. */
  openShiftsAvailable: number;
}

export const EMPTY_OVERVIEW: DashboardOverview = {
  shift: null,
  schedule: [],
  openShifts: [],
  openShiftsAvailable: 0,
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const user = await getCurrentUser();
  // The clock runs locally (localStorage) until the time-clock API exists, so it always gets
  // today's sample shift and stays usable even when signed out.
  if (!user) return { ...EMPTY_OVERVIEW, shift: SHIFT };
  return { shift: SHIFT, schedule: SCHEDULE, openShifts: OPEN_SHIFTS, openShiftsAvailable: 3 };
}
