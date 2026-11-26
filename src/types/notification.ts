// An in-app notification (Figma 51:11625), mapped from the Notifications API
// (GET /api/notifications/inbox, see docs/command-center.md §5).

/** The API's feed categories. Figma only draws schedule, tasks and homes. */
export type NotificationKind =
  "homes" | "messages" | "announcements" | "schedule" | "tasks" | "attendance" | "hr_documents";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  /** Full text; the collapsed row shows one line with "…". */
  message: string;
  /** Relative time as shown, e.g. "10 min ago", "Yesterday". */
  time: string;
  read: boolean;
  /** Where "View …" goes, from the item's destination; else the kind's default page. */
  href?: string;
}
