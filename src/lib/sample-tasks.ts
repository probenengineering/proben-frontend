import type { CalendarDay, CalendarEventData } from "@/components/organisms";
import type { TaskRecord } from "@/lib/tasks";

// Sample My Tasks data copied from the Figma frames, until real data is wired up.
// Event times show Figma's labels as written (e.g. the 9:30 green event also reads "9:00 AM").

export const CALENDAR_DAYS: CalendarDay[] = [
  { weekday: "SUN", date: 21, tone: "weekend" },
  { weekday: "MON", date: 22 },
  { weekday: "TUE", date: 23 },
  { weekday: "WED", date: 24 },
  { weekday: "THU", date: 25, tone: "today" },
  { weekday: "FRI", date: 26 },
  { weekday: "SAT", date: 27, tone: "weekend" },
];

const designReview = {
  time: "9:00 AM",
  title: "Design Review: Acme Marketi...",
  color: "blue",
} as const;
const webinar = { time: "9:00 AM", title: "Webinar: Figma ...", color: "green" } as const;

export const CALENDAR_EVENTS: CalendarEventData[] = [
  { day: 1, start: 8, duration: 1, time: "8:00 AM", title: "Monday Wake-Up Hour", video: true },
  { day: 1, start: 9, duration: 0.5, ...designReview },
  { day: 1, start: 9.5, duration: 0.5, ...webinar },
  { day: 2, start: 9, duration: 1, time: "9:00 AM", title: "☕️ Coffee Chat", video: true },
  { day: 4, start: 9, duration: 0.5, ...designReview },
  { day: 4, start: 9.5, duration: 0.5, ...webinar },
  ...[2, 4].map((day) => ({
    day,
    start: 10,
    duration: 1,
    time: "10:00 AM",
    title: "Health Benefits Walkthrough",
    color: "purple" as const,
    video: true,
  })),
  {
    day: 1,
    start: 11,
    duration: 1,
    time: "11:00 AM",
    title: "🍔 New Employee Welcome Lunch!",
    color: "purple",
    plain: true,
  },
  ...[2, 4].map((day) => ({
    day,
    start: 11,
    duration: 1,
    time: "11:00 AM",
    title: "Onboarding Presentation",
    color: "purple" as const,
    video: true,
  })),
  ...[1, 4].map((day) => ({
    day,
    start: 12,
    duration: 1,
    time: "12:00 PM",
    title: "🍔 Design System Kickoff Lunch",
    video: true,
  })),
  {
    day: 2,
    start: 12,
    duration: 1,
    time: "12:00 PM",
    title: "🥗 Marketing Meet-and-Greet",
    video: true,
  },
  { day: 1, start: 13, duration: 1, time: "1:00 PM", title: "Design Review", video: true },
  {
    day: 2,
    start: 13,
    duration: 1,
    time: "1:00 PM",
    title: "MVP Prioritization Workshop",
    video: true,
  },
  {
    day: 1,
    start: 14,
    duration: 1,
    time: "2:00 PM",
    title: "1:1 with Heather",
    color: "amber",
    video: true,
  },
  {
    day: 2,
    start: 14,
    duration: 1,
    time: "2:00 PM",
    title: "Concept Design Review II",
    video: true,
  },
  {
    day: 3,
    start: 15,
    duration: 1,
    time: "2:00 PM",
    title: "1:1 with Heather",
    color: "amber",
    video: true,
  },
  { day: 1, start: 16, duration: 1, lane: 0, lanes: 2, ...designReview },
  { day: 1, start: 16, duration: 1, lane: 1, lanes: 2, ...webinar },
];

const vitals = {
  name: "Check Resident's Vital Signs",
  description:
    "Measure and record the resident's vital signs, including blood pressure and temperature.",
};

/** The day the sample list treats as "Today" (Figma: Tue, Oct 28, 2026). */
export const SAMPLE_TODAY = "2026-10-28";

// Figma 51:10883 (today / tomorrow) plus overdue (51:11043) and due-later examples.
export const TASK_RECORDS: TaskRecord[] = [
  { id: "t1", ...vitals, due: "2026-10-28T08:00", status: "in-progress" },
  { id: "t2", ...vitals, due: "2026-10-28T08:00", status: "completed" },
  { id: "t3", ...vitals, due: "2026-10-28T08:00", status: "pending" },
  { id: "t4", ...vitals, due: "2026-10-29T08:00", status: "pending" },
  { id: "t5", ...vitals, due: "2026-10-29T08:00", status: "pending" },
  { id: "t6", ...vitals, due: "2026-10-27T08:00", status: "pending" },
  { id: "t7", ...vitals, due: "2026-10-26T08:00", status: "pending" },
  { id: "t8", ...vitals, due: "2026-10-24T08:00", status: "in-progress" },
  { id: "t9", ...vitals, due: "2026-10-23T08:00", status: "pending" },
  { id: "t10", ...vitals, due: "2026-10-22T08:00", status: "pending" },
  { id: "t11", ...vitals, due: "2026-10-21T08:00", status: "pending" },
  { id: "t12", ...vitals, due: "2026-10-31T08:00", status: "pending" },
  { id: "t13", ...vitals, due: "2026-11-03T08:00", status: "pending" },
];
