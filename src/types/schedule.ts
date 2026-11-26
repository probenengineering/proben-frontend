import type { TypeTagTone } from "@/components/atoms";

// One row of the Schedule list (Figma 60:6752) and its detail panel (60:6829): a calendar event
// or a task with a due time, mapped from the Command Center API.

export type ScheduleStatus = "upcoming" | "in_progress" | "completed" | "overdue";

export interface ScheduleItem {
  id: string;
  kind: "event" | "task";
  title: string;
  /** Grey line under the title (the home's name for now). */
  subtitle?: string;
  /** "2026-10-25" in the home's timezone. */
  day: string;
  /** Row time: "9:00 – 9:30 AM", or "Wed 24 · 2:00 PM" in the Overdue group. */
  time: string;
  type: { label: string; tone: TypeTagTone };
  status: ScheduleStatus;
  /** Panel rows. */
  dateLabel: string;
  timeDetail: string;
  home?: string;
  description?: string;
  /** Only events can be completed from here (tasks go through their form). */
  canComplete: boolean;
}

export interface ScheduleDay {
  /** "2026-10-25". */
  key: string;
  /** "Thursday, 25 Oct". */
  label: string;
  today: boolean;
  items: ScheduleItem[];
}

export interface ScheduleList {
  monthLabel: string;
  /** Overdue items from before today. */
  overdue: ScheduleItem[];
  /** Today to Saturday. */
  days: ScheduleDay[];
  error?: string;
}
