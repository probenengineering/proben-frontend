import "server-only";

import { connection } from "next/server";

import { notFound } from "next/navigation";

import type { IconName } from "@/components/atoms";
import { ApiError, errorMessage } from "@/lib/auth/api";
import { can, canPersonally, PERMISSIONS } from "@/lib/auth/permissions";
import { sessionEnded } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/user";
import { getTimezone } from "@/lib/command-center/api";
import type {
  HomeOption,
  ProfileAbilities,
  ProfileActivity,
  ProfileHome,
  ProfileTask,
  StaffProfile,
} from "@/lib/staff-profile";

import {
  getStaff,
  listAdminTasks,
  listOrgHomes,
  listPermissions,
  listRoles,
  listStaffActivity,
} from "./api";
import { EMPLOYMENT_LABELS, roleNames, sortHomes, toStaffMember } from "./mappers";
import type {
  ApiActivity,
  ApiAdminTask,
  ApiAdminTaskPage,
  ApiOrgHome,
  ApiPermission,
  ApiRole,
  ApiStaff,
  ApiStaffHome,
} from "./types";

// Staff profile from the live API (staff-management handover S8–S10): the person (GET /staff/{id}),
// their tasks and counts (GET /admin/tasks?staffId=), activity (GET /staff/{id}/activity), their
// roles' descriptions and permissions (GET /roles, GET /permissions), and the organisation's homes
// for Assign homes and activity names (GET /homes). Only the person is required; the rest is left
// out when it can't load (e.g. a viewer without task access).

export type ProfilePageResult =
  | {
      ok: true;
      profile: StaffProfile;
      /** Null when the organisation's homes couldn't load (the drawer says so, with a retry). */
      homeOptions: HomeOption[] | null;
      can: ProfileAbilities;
    }
  | { ok: false; error: string };

const optional = <T>(promise: Promise<T>) => promise.catch(() => null);

export async function getStaffProfilePage(id: string): Promise<ProfilePageResult> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  let person: ApiStaff;
  try {
    person = await getStaff(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) sessionEnded(error);
    if (error instanceof ApiError && (error.status === 404 || error.code === "VALIDATION_FAILED")) {
      notFound();
    }
    return { ok: false, error: errorMessage(error) };
  }

  const [user, tz, tasks, activity, roles, permissions, orgHomes] = await Promise.all([
    getCurrentUser(),
    getTimezone(),
    optional(listAdminTasks({ staffId: id, sort: "dueAt", limit: 5 })),
    optional(listStaffActivity(id, 25)),
    optional(listRoles()),
    optional(listPermissions()),
    optional(listOrgHomes()),
  ]);

  const homeNames = new Map<string, string>();
  for (const h of [...(orgHomes ?? []), ...person.homes])
    if (h.id && h.name) homeNames.set(h.id, h.name);
  const role = roleSummary(person, roles ?? [], permissions ?? [], tz);

  return {
    ok: true,
    profile: {
      staff: toStaffMember(person),
      phone: person.phone?.trim() ?? "",
      employmentType: person.employmentType
        ? EMPLOYMENT_LABELS[person.employmentType]
        : "Not added",
      ...taskSummary(tasks, tz),
      homes: sortHomes(person.homes).flatMap((h) => (h.id && h.name ? [toProfileHome(h, tz)] : [])),
      ...role,
      activity: activity ? activity.items.map((a) => toActivity(a, homeNames, tz)) : null,
    },
    homeOptions: orgHomes ? orgHomes.flatMap(toHomeOption) : null,
    can: {
      manage: canPersonally(user?.permissions, PERMISSIONS.staffManage),
      assignTasks:
        canPersonally(user?.permissions, "tasks.assign") ||
        can(user?.permissions, PERMISSIONS.manageOrg),
    },
  };
}

// ── Dates ─────────────────────────────────────────────────────────────────────────────────────

/** "Nov 26, 2026" in the zone. */
const day = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));

/** "Nov 26, 2026, 10:37 AM" in the zone. */
const dayTime = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

// ── Tasks ─────────────────────────────────────────────────────────────────────────────────────

const OPEN = ["upcoming", "in_progress", "submitted", "needs_attention"] as const;

const TASK_STATUS: Record<ApiAdminTask["status"], { label: string; tone: ProfileTask["tone"] }> = {
  upcoming: { label: "Upcoming", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  submitted: { label: "Waiting for review", tone: "info" },
  needs_attention: { label: "Needs attention", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

function taskSummary(page: ApiAdminTaskPage | null, tz: string) {
  if (!page) return { taskCounts: null, tasks: [], taskTotal: 0, openTasks: 0 };
  const c = page.counts;
  return {
    // Submitted (waiting for review) counts as in progress, as on My tasks.
    taskCounts: [
      { label: "Total", value: c.all },
      { label: "Upcoming", value: c.upcoming },
      { label: "In progress", value: c.in_progress + c.submitted },
      { label: "Needs attention", value: c.needs_attention, attention: true },
      { label: "Overdue", value: c.overdue },
      { label: "Completed", value: c.completed },
    ],
    tasks: page.items.map((t): ProfileTask => {
      const status = t.isOverdue
        ? { label: "Overdue", tone: "danger" as const }
        : (TASK_STATUS[t.status] ?? { label: t.status, tone: "neutral" as const });
      return {
        id: t.id,
        title: t.title,
        home: t.home?.name ?? "No home",
        due: `Due ${dayTime(t.dueAt, tz)}`,
        priority: t.priority,
        status: status.label,
        tone: status.tone,
      };
    }),
    taskTotal: c.all,
    openTasks: OPEN.reduce((sum, key) => sum + (c[key] ?? 0), 0),
  };
}

// ── Homes ─────────────────────────────────────────────────────────────────────────────────────

/** "CODE · address, city, state", leaving out what isn't recorded. */
function homeDetail(code?: string | null, ...place: (string | null | undefined)[]) {
  // "Lagos, Lagos" (city and state the same) shows once.
  const address = place.filter((v, i) => v && v !== place[i - 1]).join(", ");
  return [code, address].filter(Boolean).join(" · ") || "No address on record";
}

function toProfileHome(h: ApiStaffHome, tz: string): ProfileHome {
  return {
    id: h.id!,
    name: h.name!,
    detail: homeDetail(h.code, h.address, h.city, h.state),
    assignedOn: h.assignedAt ? `Assigned ${day(h.assignedAt, tz)}` : "",
    isPrimary: !!h.isPrimary,
  };
}

function toHomeOption(h: ApiOrgHome): HomeOption[] {
  if (!h.id || !h.name || (h.status && h.status !== "active")) return [];
  const d = h.details ?? {};
  return [
    {
      id: h.id,
      name: h.name,
      code: h.code ?? "",
      city: d.city ?? "",
      detail: homeDetail(h.code, d.address, d.city, d.state ?? d.region),
    },
  ];
}

// ── Role & access ─────────────────────────────────────────────────────────────────────────────

function roleSummary(person: ApiStaff, roles: ApiRole[], catalogue: ApiPermission[], tz: string) {
  const held = person.roles.filter((r) => r.effective !== false);
  const defs = held.flatMap((r) => roles.filter((d) => d.id === r.roleId));
  const granted = new Set(defs.flatMap((d) => d.permissions));

  // One chip per permission group, in catalogue order: "Staff · full access", "Tasks · view
  // staff task progress", or "Messaging · 4 of 10".
  const groups = new Map<string, ApiPermission[]>();
  for (const p of catalogue) groups.set(p.group, [...(groups.get(p.group) ?? []), p]);
  const permissions = [...groups].flatMap(([group, all]) => {
    const has = all.filter((p) => granted.has(p.key));
    if (has.length === 0) return [];
    const what =
      has.length === all.length
        ? "full access"
        : has.length === 1
          ? has[0].label.charAt(0).toLowerCase() + has[0].label.slice(1)
          : `${has.length} of ${all.length}`;
    return [`${group} · ${what}`];
  });

  const latest = [...held]
    .filter((r) => r.assignedAt)
    .sort((a, b) => (b.assignedAt ?? "").localeCompare(a.assignedAt ?? ""))[0];
  const by = latest?.assignedBy?.name;
  return {
    roleNames: roleNames(person.roles),
    roleDescription: defs[0]?.description ?? "",
    permissions,
    roleChange: latest?.assignedAt
      ? `Assigned ${day(latest.assignedAt, tz)}${by ? ` by ${by}` : ""}`
      : "",
  };
}

// ── Activity ──────────────────────────────────────────────────────────────────────────────────

// Every `kind` in the activity Swagger enum (27 Nov). Anything new falls back to the edit icon.
const ACTIVITY_ICONS: Record<string, IconName> = {
  account_created: "activity-account-16",
  invitation_accepted: "activity-account-16",
  account_deactivated: "activity-account-16",
  account_reactivated: "activity-account-16",
  profile_updated: "activity-edit-16",
  role_changed: "activity-role-16",
  home_assignments_changed: "activity-home-16",
  task_assigned: "activity-task-16",
  task_reassigned: "activity-task-16",
  task_updated: "activity-task-16",
};

function activityIcon(kind = ""): IconName {
  return ACTIVITY_ICONS[kind] ?? "activity-edit-16";
}

const listNames = (names: string[]) =>
  names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

/** "Assigned to Oak House", "Removed from X", or both; the API title if a home is unknown. */
function homesChangeTitle(data: Record<string, unknown> | undefined, names: Map<string, string>) {
  const ids = (key: string) =>
    Array.isArray(data?.[key]) ? (data[key] as unknown[]).filter((v) => typeof v === "string") : [];
  const added = ids("homesAdded") as string[];
  const removed = ids("homesRemoved") as string[];
  if (added.length + removed.length === 0) return null;
  if ([...added, ...removed].some((homeId) => !names.has(homeId))) return null;
  const parts = [
    added.length ? `Assigned to ${listNames(added.map((i) => names.get(i)!))}` : "",
    removed.length ? `Removed from ${listNames(removed.map((i) => names.get(i)!))}` : "",
  ].filter(Boolean);
  return parts.length === 2 ? `${parts[0]}; ${parts[1].toLowerCase()}` : parts[0];
}

function toActivity(a: ApiActivity, names: Map<string, string>, tz: string): ProfileActivity {
  const title =
    (a.kind === "home_assignments_changed" ? homesChangeTitle(a.data, names) : null) ??
    a.title ??
    "Change recorded";
  const who = a.actor?.name || (a.actor?.type === "system" ? "System" : "Someone");
  return {
    id: a.id ?? `${a.kind}-${a.at}`,
    icon: activityIcon(a.kind),
    title,
    meta: a.at ? `${who} · ${dayTime(a.at, tz)}` : who,
  };
}
