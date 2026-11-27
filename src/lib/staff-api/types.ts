// Staff management API shapes (identity and commandcenter docs-json, checked 27 Nov 2026 against
// the backend's staff-management handover). Only the fields the UI reads. Instants are ISO 8601
// UTC strings; `startDate` is a calendar date (YYYY-MM-DD).

export type ApiStaffStatus = "invited" | "active" | "deactivated";
export type ApiEmploymentType = "full_time" | "part_time" | "contract" | "bank";

export interface ApiActor {
  id?: string | null;
  name?: string | null;
  type?: string;
}

export interface ApiStaffHome {
  id?: string;
  name?: string;
  isPrimary?: boolean;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  assignedAt?: string;
}

export interface ApiStaffRole {
  roleId?: string;
  key?: string;
  name?: string;
  /** Set when the role applies to one home only. */
  homeId?: string | null;
  assignedAt?: string;
  assignedBy?: ApiActor | null;
  /** False once the home is closed or the person leaves it (the assignment then grants nothing). */
  effective?: boolean;
}

export interface ApiStaff {
  id: string;
  /** "STF-0101"; server-generated, display only. */
  staffNumber: string;
  employmentType: ApiEmploymentType | null;
  startDate: string | null;
  avatarFileId: string | null;
  /** Authenticated relative path; fetch through our server, not a plain <img src>. */
  avatarUrl: string | null;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jobTitle?: string | null;
  phone?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  status: ApiStaffStatus;
  invitedAt?: string | null;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  deactivationReason?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  homes: ApiStaffHome[];
  teams: { id?: string; name?: string; homeId?: string | null }[];
  roles: ApiStaffRole[];
}

export interface ApiStaffCounts {
  all: number;
  active: number;
  invited: number;
  deactivated: number;
}

export interface ApiStaffPage {
  items: ApiStaff[];
  total: number;
  limit: number;
  offset: number;
  /** The caller's whole staff scope, before search, filters and paging. */
  counts: ApiStaffCounts;
}

export type ApiStaffSort = "name" | "-name" | "createdAt" | "-createdAt";

export interface ApiActivity {
  id?: string;
  kind?: string;
  title?: string;
  actor?: ApiActor;
  at?: string;
  data?: Record<string, unknown>;
}

export interface ApiRole {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  /** Advisory: whether the caller may give this role (to `staffId` when asked for one). */
  assignable?: boolean;
  assignableScopes?: { providerWide?: boolean; homeIds?: string[] };
  recommendedScope?: "provider" | "homes";
  /** Distinct people holding the role. */
  assignedCount?: number;
}

export interface ApiPermission {
  key: string;
  description: string;
  scope: "personal" | "home" | "provider";
  label: string;
  group: string;
}

/** GET /api/identity/homes. */
export interface ApiOrgHome {
  id?: string;
  name?: string;
  code?: string | null;
  status?: string;
  details?: { address?: string; city?: string; state?: string; region?: string; timezone?: string };
  staffCount?: number;
}

export type ApiCoverage = "covered" | "no_manager" | "one_staff";

export interface ApiHomeStaffing {
  id?: string;
  name?: string;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  staff?: { id?: string; displayName?: string; avatarUrl?: string | null }[];
  manager?: { id?: string; displayName?: string } | null;
  managers?: { id?: string; displayName?: string }[];
  staffCount?: number;
  coverage?: ApiCoverage;
}

export interface ApiHomeStaffingPage {
  items: ApiHomeStaffing[];
  total: number;
  limit: number;
  offset: number;
  totals: { homes: number; staff: number };
}

export type ApiAdminTaskStatus =
  "upcoming" | "in_progress" | "submitted" | "completed" | "needs_attention" | "cancelled";

export interface ApiAdminTask {
  id: string;
  staffId: string;
  homeId: string | null;
  title: string;
  description: string;
  source: string;
  referenceUrl?: string | null;
  startedAt?: string | null;
  staff?: { id: string; displayName: string | null; avatarUrl: string | null };
  home?: { id: string; name: string | null } | null;
  assignedAt?: string;
  assignedBy?: { id: string; name: string | null; role: string | null; team: string | null };
  priority: "low" | "medium" | "high";
  dueAt: string;
  status: ApiAdminTaskStatus;
  version: number;
  feedback: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  isOverdue?: boolean;
  summary?: string | null;
  createdBy?: { id: string; name: string | null; role: string | null; team: string | null };
  instructions?: string[];
  referenceFileIds?: string[];
  answers?: Record<string, unknown>;
  attachments?: string[];
}

export type ApiTaskCounts = Record<ApiAdminTaskStatus | "all" | "overdue", number>;

export interface ApiAdminTaskPage {
  items: ApiAdminTask[];
  total: number;
  limit: number;
  offset: number;
  counts: ApiTaskCounts;
}

export type ApiTaskSort = "due" | "recent" | "dueAt" | "-dueAt" | "priority" | "staff";
