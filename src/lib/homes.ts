import "server-only";

import { redirect } from "next/navigation";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";
import {
  getTimezone,
  listHomes,
  listShifts,
  listTasks,
  requestTime,
} from "@/lib/command-center/api";
import { addDays, dayKey, formatDay, formatTime } from "@/lib/command-center/time";
import type { ApiHome, ApiShift } from "@/lib/command-center/types";
import type { AssignedHome } from "@/types/home";

// My Homes from the Command Center API: GET /homes, plus your open tasks per home (GET /tasks)
// and your next shift per home (GET /shifts, next 30 days). Not signed in → none (Figma 51:11543).

const DAY = 24 * 60 * 60_000;
const CLOSED = new Set(["completed", "cancelled"]);

export interface HomesResult {
  homes: AssignedHome[];
  /** Epoch ms the homes were loaded ("Updated 2 min ago"). */
  loadedAt?: number;
  /** Set when the homes couldn't load; shown instead of the empty state. */
  error?: string;
}

export async function getAssignedHomes(): Promise<HomesResult> {
  if (!(await getAccessToken())) return { homes: [] };
  try {
    const now = await requestTime();
    const [homes, tasks, shifts, tz] = await Promise.all([
      listHomes(),
      listTasks().catch(() => null),
      listShifts({ from: now, to: now + 30 * DAY }).catch(() => null),
      getTimezone(),
    ]);
    const openTasks = new Map<string, number>();
    for (const task of tasks?.items ?? []) {
      if (task.homeId && !CLOSED.has(task.status)) {
        openTasks.set(task.homeId, (openTasks.get(task.homeId) ?? 0) + 1);
      }
    }
    const next = new Map<string, ApiShift>();
    for (const shift of shifts?.items ?? []) {
      const seen = next.get(shift.homeId);
      if (shift.status !== "cancelled" && (!seen || shift.startsAt < seen.startsAt)) {
        next.set(shift.homeId, shift);
      }
    }
    return {
      loadedAt: now,
      homes: homes.items.map((home) =>
        toHome(home, openTasks.get(home.id) ?? 0, next.get(home.id), tz, now),
      ),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/sign-in");
    return { homes: [], error: errorMessage(error) };
  }
}

function toHome(
  home: ApiHome,
  openTasks: number,
  next: ApiShift | undefined,
  fallbackTz: string,
  now: number,
): AssignedHome {
  const d = home.details ?? {};
  const tz = d.timezone ?? fallbackTz;
  const address = [d.address, d.city, d.region, d.postalCode].filter(Boolean).join(", ");
  const coordinates =
    d.latitude !== undefined && d.longitude !== undefined
      ? { lat: d.latitude, lng: d.longitude }
      : undefined;
  return {
    id: home.id,
    name: home.name,
    address: address && `${address}.`,
    residents: home.residentsCount ?? null,
    openTasks,
    email: home.contact?.email ?? undefined,
    phone: home.contact?.phone ?? undefined,
    notificationsMuted: home.notificationsMuted ?? false,
    nextSchedule: next
      ? {
          day: dayLabel(next.startsAt, tz, now),
          time: formatTime(next.startsAt, tz).replace(" ", ""),
        }
      : null,
    coordinates,
    code: home.code ?? undefined,
    street: d.address || undefined,
    cityLine:
      [d.city, [d.region, d.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ") ||
      undefined,
    city: d.city || undefined,
    assignment: {
      status: home.assignmentStatus === "upcoming" ? "upcoming" : "active",
      label:
        home.assignmentStatus === "upcoming"
          ? home.startsAt
            ? `Starts ${formatDay(dayKey(home.startsAt, tz), { month: "short", day: "numeric" })}`
            : "Upcoming"
          : "Active",
    },
    role: home.assignmentRole ?? undefined,
    region: d.region || undefined,
    postalCode: d.postalCode || undefined,
    assignedSince: home.startsAt
      ? formatDay(dayKey(home.startsAt, tz), { month: "short", day: "numeric", year: "numeric" })
      : undefined,
    nextShift: next
      ? `${formatDay(dayKey(next.startsAt, tz), { weekday: "short", month: "short", day: "numeric" })} · ${formatTime(next.startsAt, tz)}`
      : undefined,
    onMap: (home.onMap ?? true) && !!coordinates,
  };
}

/** "Today", "Tomorrow" or "Nov 5, 2026", in the home's timezone. */
function dayLabel(iso: string, tz: string, now: number) {
  const key = dayKey(iso, tz);
  const today = dayKey(now, tz);
  if (key === today) return "Today";
  if (key === addDays(today, 1)) return "Tomorrow";
  return formatDay(key, { month: "short", day: "numeric", year: "numeric" });
}
