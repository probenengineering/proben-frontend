// A care home assigned to the signed-in caregiver (My Homes tab, Figma 51:12496 / 51:12625),
// mapped from the Command Center API (GET /homes, docs/command-center.md §4).
export interface AssignedHome {
  id: string;
  name: string;
  /** One line, e.g. "12, Maryland Avenue, maryland,Lagos 100213." */
  address: string;
  /** null (not set by the provider) shows "—". */
  residents: number | null;
  /** Your open tasks at this home (from GET /tasks). */
  openTasks: number;
  /** Next shift at this home: day ("Today", "Tomorrow", "Nov 5, 2026") and time ("10:00AM"). */
  nextSchedule: { day: string; time: string } | null;
  email?: string;
  phone?: string;
  /** Your push notifications for this home are muted. */
  notificationsMuted: boolean;
  coordinates?: { lat: number; lng: number };
  /** My homes list (Figma 60:12810): "GH-1076", "123 Madelan Road", "Madison, WI 53711". */
  code?: string;
  street?: string;
  cityLine?: string;
  city?: string;
  assignment: { status: "active" | "upcoming"; label: string };
  role?: string;
  onMap: boolean;
  /** Home detail (Figma 60:13792): "WI", "53704", "Mar 3, 2025", "Fri, Oct 26 · 8:00 AM". */
  region?: string;
  postalCode?: string;
  assignedSince?: string;
  nextShift?: string;
}

/** Someone on a home's team (GET /homes/{id}/team). */
export interface HomeTeamMember {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  /** The signed-in person ("This is you"). */
  isYou?: boolean;
  /** "On shift · until 5:00 PM" (success), "Starts 4:00 PM" (info), "Off today" (neutral). */
  shift?: { label: string; tone: "success" | "info" | "neutral" };
}

/** One shift on the Home schedule tab (Figma 60:14195). */
export interface HomeShift {
  id: string;
  /** "2026-10-25" in the home's timezone. */
  day: string;
  /** "7:00 AM – 3:00 PM". */
  time: string;
  title?: string;
  staff: string[];
  filled: number;
  needed?: number;
  mine: boolean;
  inProgress: boolean;
}

/** One update on the Home updates tab (Figma 60:14309). */
export interface HomeUpdateItem {
  id: string;
  title: string;
  body: string;
  author: string;
  authorRole?: string;
  /** "2h ago", "Yesterday, 4:40 PM", "Oct 22". */
  when: string;
  requiresAck: boolean;
  /** "Oct 25, 10:58 AM" once you've acknowledged it. */
  acknowledged?: string;
  createdAt: number;
  /** Posted in the last 7 days ("This week"). */
  thisWeek: boolean;
}

/** One file on the Resources tab (Figma 60:14603). */
export interface HomeResource {
  id: string;
  fileId: string;
  /** "Emergency evacuation plan.pdf". */
  name: string;
  /** "Oct 2, 2026". */
  updated: string;
  /** "1.2 MB". */
  size?: string;
  /** "pdf", "image", "sheet", "doc" or "other": picks the icon and whether it can preview. */
  kind: "pdf" | "image" | "sheet" | "doc" | "other";
}
