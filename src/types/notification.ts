// An in-app notification (Figma 51:11625). Shape matches docs/command-center.md §5.
export type NotificationKind = "schedule" | "task" | "home";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  /** Full text; the collapsed row shows one line with "…". */
  message: string;
  /** Relative time as shown, e.g. "10 min ago", "Yesterday". */
  time: string;
  read: boolean;
}
