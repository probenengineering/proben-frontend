import "server-only";

import {
  getHomeSchedule,
  getHomeTeam,
  getTimezone,
  getTodayOverview,
  listHomeResources,
  listHomeUpdates,
  requestTime,
} from "@/lib/command-center/api";
import { addDays, dayKey, formatDay, formatTime, startOfDay } from "@/lib/command-center/time";
import { weekStartOf } from "@/lib/calendar-view";
import { getFilesAction } from "@/lib/command-center/task-actions";
import { formatBytes } from "@/lib/format-bytes";
import type {
  AssignedHome,
  HomeResource,
  HomeShift,
  HomeTeamMember,
  HomeUpdateItem,
} from "@/types/home";

import { getAssignedHomes } from "./homes";

// A home's page (Figma 60:13792 overview, 60:13930 team, 60:14124 schedule, 60:14244 updates):
// the home from GET /homes, its team (GET /homes/{id}/team, always: names for updates), and the
// open tab's data. Team and schedule responses aren't documented, so they're read defensively:
// common list keys (items / members / staff / shifts) and field names; anything missing is left
// out rather than guessed.

export type HomeTab = "overview" | "team" | "schedule" | "updates" | "resources";

export interface HomeDetailData {
  home?: AssignedHome;
  team: HomeTeamMember[];
  schedule?: { week: string[]; day: string; today: string; shifts: HomeShift[] };
  updates?: HomeUpdateItem[];
  resources?: HomeResource[];
  error?: string;
}

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === "number" ? v : undefined);
const list = (d: unknown, keys: string[]): Raw[] => {
  if (Array.isArray(d)) return d as Raw[];
  const o = d as Raw | null;
  return (keys.map((k) => o?.[k]).find(Array.isArray) as Raw[] | undefined) ?? [];
};
const nameOf = (m: Raw | undefined) =>
  str(m?.name) ??
  str(m?.displayName) ??
  ([str(m?.firstName), str(m?.lastName)].filter(Boolean).join(" ") || undefined);

function readTeam(data: unknown, meId: string | undefined, tz: string, now: number) {
  return list(data, ["items", "members", "staff", "team"]).flatMap((m, i): HomeTeamMember[] => {
    const name = nameOf(m);
    if (!name) return [];
    const id = str(m.id) ?? str(m.staffId) ?? `member-${i}`;
    const ends = str(m.shiftEndsAt) ?? str((m.currentShift as Raw)?.endsAt);
    const starts = str(m.nextShiftStartsAt) ?? str((m.nextShift as Raw)?.startsAt);
    const shift =
      m.onShift === true && ends
        ? { label: `On shift · until ${formatTime(ends, tz)}`, tone: "success" as const }
        : starts && dayKey(starts, tz) === dayKey(now, tz)
          ? { label: `Starts ${formatTime(starts, tz)}`, tone: "info" as const }
          : m.onShift === false
            ? { label: "Off today", tone: "neutral" as const }
            : undefined;
    return [
      {
        id,
        name,
        role: str(m.role) ?? str(m.jobTitle) ?? str(m.title) ?? str(m.assignmentRole),
        phone: str(m.phone) ?? str(m.phoneNumber),
        isYou:
          m.isYou === true ||
          m.isCurrentUser === true ||
          (!!meId && (id === meId || str(m.staffId) === meId)),
        shift,
      },
    ];
  });
}

function readShifts(data: unknown, tz: string, now: number): HomeShift[] {
  return list(data, ["items", "shifts"]).flatMap((s): HomeShift[] => {
    const startsAt = str(s.startsAt);
    const endsAt = str(s.endsAt);
    if (!startsAt || !endsAt || s.status === "cancelled") return [];
    const people = list(s, ["staff", "assignees", "members", "assignments"]);
    const staff = people
      .map((p) => nameOf(p) ?? nameOf(p.staff as Raw))
      .filter((n): n is string => !!n);
    const start = Date.parse(startsAt);
    return [
      {
        id: str(s.id) ?? startsAt,
        day: dayKey(startsAt, tz),
        time: `${formatTime(startsAt, tz)} – ${formatTime(endsAt, tz)}`,
        title: str(s.title) ?? str(s.name),
        staff,
        filled: num(s.filledCount) ?? staff.length,
        needed: num(s.requiredStaff) ?? num(s.capacity) ?? num(s.slots),
        mine: s.isMine === true || s.assignedToMe === true,
        inProgress: start <= now && now < Date.parse(endsAt),
      },
    ];
  });
}

function when(iso: string, tz: string, now: number) {
  const hours = Math.floor((now - Date.parse(iso)) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24 && dayKey(iso, tz) === dayKey(now, tz)) return `${hours}h ago`;
  if (dayKey(iso, tz) === addDays(dayKey(now, tz), -1)) return `Yesterday, ${formatTime(iso, tz)}`;
  return formatDay(dayKey(iso, tz), { month: "short", day: "numeric" });
}

export async function getHomeDetail(
  id: string,
  tab: HomeTab = "overview",
  focusDay?: string,
): Promise<HomeDetailData> {
  const [{ homes, error }, teamRaw, overview, tz, now] = await Promise.all([
    getAssignedHomes(),
    getHomeTeam(id).catch(() => null),
    getTodayOverview().catch(() => null),
    getTimezone(),
    requestTime(),
  ]);
  const team = readTeam(teamRaw, overview?.overview.profile?.id, tz, now);
  const result: HomeDetailData = { home: homes.find((h) => h.id === id), team, error };
  if (!result.home) return result;

  if (tab === "schedule") {
    const today = dayKey(now, tz);
    const day = focusDay && /^\d{4}-\d{2}-\d{2}$/.test(focusDay) ? focusDay : today;
    const sunday = weekStartOf(day);
    const week = Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
    const raw = await getHomeSchedule(id, {
      from: startOfDay(sunday, tz),
      to: startOfDay(addDays(sunday, 7), tz),
    }).catch(() => null);
    result.schedule = { week, day, today, shifts: readShifts(raw, tz, now) };
  }

  if (tab === "updates") {
    const page = await listHomeUpdates(id).catch(() => null);
    result.updates = (page?.items ?? []).map((u) => {
      const author = team.find((m) => m.id === u.createdById);
      return {
        id: u.id,
        title: u.title,
        body: u.body,
        author: author?.name ?? "Home team",
        authorRole: author?.role,
        when: when(u.createdAt, tz, now),
        requiresAck: u.requiresAck,
        acknowledged: u.acknowledgedAt
          ? `${formatDay(dayKey(u.acknowledgedAt, tz), { month: "short", day: "numeric" })}, ${formatTime(u.acknowledgedAt, tz)}`
          : undefined,
        createdAt: Date.parse(u.createdAt),
        thisWeek: now - Date.parse(u.createdAt) < 7 * 24 * 60 * 60_000,
      };
    });
  }
  if (tab === "resources") {
    const page = await listHomeResources(id).catch(() => null);
    const items = page?.items ?? [];
    const files = await getFilesAction(items.map((r) => r.fileId));
    result.resources = items.map((r) => {
      const file = files.find((f) => f.id === r.fileId);
      const name = file && !file.unavailable ? file.name : r.title;
      return {
        id: r.id,
        fileId: r.fileId,
        name,
        updated: formatDay(dayKey(r.createdAt, tz), {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        size: formatBytes(file?.size),
        kind: kindOf(name),
      };
    });
  }
  return result;
}

function kindOf(name: string): HomeResource["kind"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (["xlsx", "xls", "csv"].includes(ext)) return "sheet";
  if (["doc", "docx", "txt", "rtf"].includes(ext)) return "doc";
  return "other";
}
