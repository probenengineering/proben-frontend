import type { AppNotification } from "@/types/notification";

// Sample notifications from the Figma frames (51:11625 / 51:12260), until the API is wired up.
const homeAssignment = {
  kind: "home" as const,
  title: "New home assignment",
  message: "You've been assigned to Riverside Home.",
  time: "Yesterday",
};

export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "schedule",
    title: "Shift schedule updated",
    message:
      "Your scheduled shift at Maryland Home has been changed from 8:00 AM – 4:00 PM to 9:00 AM – 5:00 PM. Please review your updated schedule before your next shift.",
    time: "10 min ago",
    read: false,
  },
  {
    id: "n2",
    kind: "task",
    title: "New task assigned",
    message: "You've been assigned a new task at Landville Home.",
    time: "45 min ago",
    read: false,
  },
  { id: "n3", ...homeAssignment, read: false },
  { id: "n4", ...homeAssignment, read: true },
  { id: "n5", ...homeAssignment, read: true },
  { id: "n6", ...homeAssignment, read: true },
];
