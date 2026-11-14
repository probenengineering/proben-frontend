import type { CalendarDay, CalendarEventData, TaskGroupProps } from "@/components/organisms";

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

const dayCare = { home: "Becharbum Group Home", role: "Day Care", time: "08 : 00 AM" };

export const TASK_GROUPS: TaskGroupProps[] = [
  {
    title: "Today",
    date: "Tue, Oct 28, 2026",
    available: 3,
    tasks: [
      { ...dayCare, status: "pending" },
      { ...dayCare, status: "in-progress" },
      { ...dayCare, status: "pending" },
    ],
  },
  {
    title: "Tomorrow",
    date: "Wed, Oct 29, 2026",
    available: 2,
    tasks: [
      { ...dayCare, status: "pending" },
      { ...dayCare, status: "pending" },
    ],
  },
];
