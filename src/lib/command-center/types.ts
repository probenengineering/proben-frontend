import type { TaskField } from "@/types/task-table";

// Command Center API shapes (GET /api/commandcenter/docs-json, v0.1.0). Only the fields the
// UI reads. All instants are ISO 8601 UTC strings.

export interface ApiHomeDetails {
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  /** IANA zone, e.g. "Africa/Lagos". Calendar grouping is done in this zone. */
  timezone?: string;
  requireLocation?: boolean;
  /** Clock-in radius around latitude/longitude. */
  geofenceRadiusMeters?: number;
}

export interface ApiHome {
  id: string;
  name: string;
  details?: ApiHomeDetails;
  assignmentStatus?: "active" | "upcoming";
  assignmentRole?: string | null;
  /** "GH-1076". */
  code?: string | null;
  /** Assignment start (an upcoming assignment shows "Starts Nov 1"). */
  startsAt?: string | null;
  /** False when the home has no coordinates yet ("Not on map"). */
  onMap?: boolean;
  residentsCount?: number | null;
  contact?: { email: string | null; phone: string | null } | null;
  /** Your home-scoped push is muted (PATCH /homes/{id}/notifications). */
  notificationsMuted?: boolean;
}

export interface ApiShift {
  id: string;
  homeId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  breakMinutes?: number;
  status: "scheduled" | "cancelled";
  home?: ApiHome;
}

/** pending_approval: a manual clock-in request is waiting for a manager. */
export type ApiAttendanceStatus =
  "not_clocked_in" | "working" | "on_break" | "completed" | "pending_approval";

export interface ApiAttendance {
  status: ApiAttendanceStatus;
  attendance: {
    id: string;
    shiftId: string;
    clockedInAt: string;
    clockedOutAt?: string | null;
    breakStartedAt?: string | null;
    breakSeconds?: number;
    shiftEndsAt?: string;
    breakAllowanceMinutes?: number;
  } | null;
  serverTime: string;
  /** Live totals as of serverTime (missing when not clocked in). */
  breakSeconds?: number;
  workedSeconds?: number;
  /** The latest manual clock-in request for the current shift, if any. */
  manualClockInRequest?: {
    id: string;
    shiftId: string;
    status: "pending" | "approved" | "rejected";
    feedback?: string | null;
  } | null;
}

export interface ApiEvent {
  id: string;
  homeId?: string | null;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  completedAt?: string | null;
}

export type ApiTaskStatus =
  "upcoming" | "in_progress" | "submitted" | "completed" | "needs_attention" | "cancelled";

export interface ApiTask {
  id: string;
  homeId?: string | null;
  title: string;
  description?: string;
  dueAt?: string;
  status: ApiTaskStatus;
  isOverdue?: boolean;
  /** training_policies | hr | documents | organizational | announcements. */
  source?: string;
  priority?: "low" | "medium" | "high";
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  submittedAt?: string | null;
  /** Reviewer's note when the task was sent back (needs_attention). */
  feedback?: string | null;
  /** Form fields; a task with required fields is finished through its form, not "Mark as complete". */
  fields?: TaskField[];
  answers?: Record<string, string | number | boolean | null>;
  /** File ids (files service) attached to the draft / submission. */
  attachments?: string[];
  /** Optimistic-lock version for /start and /submit. */
  version?: number;
}

export interface Page<T> {
  items: T[];
  total?: number;
}

export interface ApiOverview {
  serverTime: string;
  profile?: { id: string; displayName: string; jobTitle?: string | null };
  attendance: ApiAttendance;
  schedule: Page<ApiShift>;
  openShifts: Page<ApiShift>;
  needsAttention?: { items: ApiTask[] };
}

/** GET /homes/{id}/updates items. */
export interface ApiHomeUpdate {
  id: string;
  homeId: string;
  title: string;
  body: string;
  requiresAck: boolean;
  createdById: string;
  /** The author, as shown on the update card. */
  createdBy?: { id: string; name: string; role?: string | null } | null;
  createdAt: string;
  acknowledgedAt?: string | null;
}

/** GET /homes/{id}/resources items. */
export interface ApiHomeResource {
  id: string;
  homeId: string;
  title: string;
  fileId: string;
  contentPath?: string;
  createdById: string;
  createdAt: string;
}
