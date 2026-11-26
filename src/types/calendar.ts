import type { CalendarEventColor } from "@/components/molecules/CalendarEvent";

import type { ScheduleItem } from "./schedule";

// Data for the Day (Figma 60:8532 / 60:8851) and Month (60:9128) calendar views.

export interface DayEvent {
  /** Hours from midnight, e.g. 9.5 = 9:30. */
  start: number;
  duration: number;
  /** "9:00 AM – 9:30 AM". */
  time: string;
  title: string;
  subtitle?: string;
  color: CalendarEventColor;
  /** Events and tasks (clickable); shifts have none. */
  item?: ScheduleItem;
}

export interface MiniMonthDay {
  key: string;
  day: number;
  inMonth: boolean;
  today: boolean;
  selected: boolean;
  hasItems: boolean;
}

export interface DayCalendarData {
  /** "2026-10-25". */
  focus: string;
  /** "THU". */
  weekday: string;
  date: number;
  today: boolean;
  monthLabel: string;
  startHour: number;
  endHour: number;
  events: DayEvent[];
  /** The red now line, when the day shown is today. */
  now?: { hour: number; label: string };
  mini: { monthLabel: string; weeks: MiniMonthDay[][]; prev: string; next: string };
  summary: {
    total: number;
    done: number;
    left: number;
    upNext?: { item: ScheduleItem; label: string };
    /** "Nothing else today. Next task: Mon 29 Oct, 9:00 AM". */
    note?: string;
  };
  error?: string;
}

export interface MonthChip {
  /** "9:00". */
  time: string;
  title: string;
  color: CalendarEventColor;
  item?: ScheduleItem;
}

export interface MonthCell {
  key: string;
  day: number;
  inMonth: boolean;
  today: boolean;
  chips: MonthChip[];
}

export interface MonthCalendarData {
  monthLabel: string;
  weeks: MonthCell[][];
  error?: string;
}
