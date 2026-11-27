import type { IconName } from "@/components/atoms";

import type { StaffMember } from "./staff";

// Staff profile view model (Figma 103:18913 overview, 103:19039 activity), built on the server
// from the live API by lib/staff-api/profile.ts. Safe on server and client.

export interface ProfileTask {
  id: string;
  title: string;
  home: string;
  /** "Due Nov 28, 2026, 5:00 PM". */
  due: string;
  priority: "high" | "medium" | "low";
  status: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
}

export interface ProfileHome {
  id: string;
  name: string;
  /** "GH-1042 · 123 Oakridge Ave, Madison, WI". */
  detail: string;
  /** "Assigned Mar 6, 2025". */
  assignedOn: string;
  isPrimary: boolean;
}

/** A home that can be added in the Assign homes drawer. */
export interface HomeOption {
  id: string;
  name: string;
  code: string;
  city: string;
  detail: string;
}

export interface ProfileActivity {
  id: string;
  icon: IconName;
  title: string;
  meta: string;
}

export interface StaffProfile {
  staff: StaffMember;
  /** "" when not recorded. */
  phone: string;
  employmentType: string;
  /** Null when the tasks couldn't load (e.g. no task permission): the Tasks card is left out. */
  taskCounts: { label: string; value: number; attention?: boolean }[] | null;
  tasks: ProfileTask[];
  /** Every task assigned to this person (the API's `all` count). */
  taskTotal: number;
  /** Upcoming, in progress, waiting for review or needing attention. */
  openTasks: number;
  homes: ProfileHome[];
  /** Every distinct role name, provider-wide first. */
  roleNames: string[];
  roleDescription: string;
  permissions: string[];
  /** "Assigned Nov 25, 2026 by Ada Okafor", or "" when unknown. */
  roleChange: string;
  /** Null when the activity couldn't load. */
  activity: ProfileActivity[] | null;
}

/** What the signed-in person may do on this profile (the backend still checks every write). */
export interface ProfileAbilities {
  /** staff.manage: roles, homes, invitations, deactivation. */
  manage: boolean;
  /** tasks.assign (or org.manage): Assign task. */
  assignTasks: boolean;
}
