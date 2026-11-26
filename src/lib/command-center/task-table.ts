import "server-only";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { getAccessToken, sessionEnded } from "@/lib/auth/session";
import type { TaskTableData, TaskTableItem, TaskTableStatus } from "@/types/task-table";

import { getTimezone, listHomes, listTasks, requestTime } from "./api";
import { dayLabel } from "./schedule-items";
import { dayKey, formatDay, formatTime, timezoneLabels } from "./time";
import type { ApiTask } from "./types";

// My tasks table (Figma 60:11012) from GET /tasks: every non-cancelled task, with its source,
// priority, due date (+ "3 days overdue" / "Tomorrow" / "In 5 days") and status. Search, filters
// and sort run in the browser (TaskTable).

const SOON_DAYS = 5;

function statusOf(t: ApiTask): TaskTableStatus {
  if (t.status === "completed") return "completed";
  // Submitted = waiting for review: the In progress bucket, never overdue.
  if (t.status === "submitted") return "in_progress";
  if (t.isOverdue) return "overdue";
  if (t.status === "needs_attention") return "needs_attention";
  return t.status === "in_progress" ? "in_progress" : "upcoming";
}

/** Whole days between two "YYYY-MM-DD" keys. */
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** "Oct 22, 2026". */
const longDate = (key: string) =>
  `${formatDay(key, { month: "short" })} ${Number(key.slice(8))}, ${key.slice(0, 4)}`;

function due(t: ApiTask, today: string, tz: string) {
  if (!t.dueAt) return { dueTone: "later" as const };
  const key = dayKey(t.dueAt, tz);
  const days = daysBetween(today, key);
  const dueDate = longDate(key);
  if (days < 0 || t.isOverdue) {
    const late = Math.max(1, -days);
    return {
      dueDate,
      dueRelative: `${late} day${late === 1 ? "" : "s"} overdue`,
      dueTone: "overdue" as const,
    };
  }
  const dueRelative = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
  return {
    dueDate,
    dueRelative,
    dueTone: days <= SOON_DAYS ? ("soon" as const) : ("later" as const),
  };
}

/** "Oct 20, 2026" + "On time" / "2 days late" (late = finished on a later day than due). */
function completion(t: ApiTask, tz: string) {
  const at = t.completedAt ?? t.submittedAt;
  if (!at) return { completedAt: 0 };
  const key = dayKey(at, tz);
  const late = t.dueAt ? daysBetween(dayKey(t.dueAt, tz), key) : 0;
  return {
    completedAt: Date.parse(at),
    completedDate: longDate(key),
    completedRelative: late > 0 ? `${late} day${late === 1 ? "" : "s"} late` : "On time",
    completedLate: late > 0,
  };
}

/** "Oct 24, 4:12 PM" / "Oct 24" for a started task with saved answers. */
function draftSaved(t: ApiTask, tz: string) {
  if (t.status === "upcoming" || !t.updatedAt || !Object.keys(t.answers ?? {}).length) return {};
  const day = formatDay(dayKey(t.updatedAt, tz), { month: "short", day: "numeric" });
  return { draftDay: day, draftSavedAt: `${day}, ${formatTime(t.updatedAt, tz)}` };
}

export async function getTaskTable(): Promise<TaskTableData> {
  if (!(await getAccessToken())) return { tasks: [] };
  try {
    const [page, tz, homes] = await Promise.all([
      listTasks(),
      getTimezone(),
      listHomes().catch(() => null),
    ]);
    const now = await requestTime();
    const today = dayKey(now, tz);
    const zone = timezoneLabels(now, tz)[0];
    const tasks = page.items.flatMap((t): TaskTableItem[] => {
      if (t.status === "cancelled") return [];
      const status = statusOf(t);
      const home = homes?.items.find((h) => h.id === t.homeId)?.name;
      const day = t.dueAt ? dayKey(t.dueAt, tz) : today;
      return [
        {
          id: t.id,
          title: t.title,
          subtitle: t.description?.split("\n")[0] || undefined,
          source: t.source || undefined,
          priority: t.priority === "high" || t.priority === "low" ? t.priority : "medium",
          ...due(t, today, tz),
          dueAt: t.dueAt ? Date.parse(t.dueAt) : Number.POSITIVE_INFINITY,
          createdAt: t.createdAt ? Date.parse(t.createdAt) : 0,
          status,
          inReview: t.status === "submitted",
          feedback: (t.status === "needs_attention" && t.feedback) || undefined,
          ...completion(t, tz),
          version: t.version,
          assignedDate: t.createdAt ? longDate(dayKey(t.createdAt, tz)) : undefined,
          fields: t.fields ?? [],
          answers: t.answers ?? {},
          ...draftSaved(t, tz),
          attachmentIds: t.attachments ?? [],
          started: t.status !== "upcoming",
          item: {
            id: t.id,
            kind: "task",
            title: t.title,
            subtitle: home,
            day,
            time: t.dueAt ? `Due ${formatTime(t.dueAt, tz)}` : "No due date",
            type: { label: "Task", tone: "amber" },
            status: status === "needs_attention" ? "upcoming" : status,
            dateLabel: t.dueAt ? dayLabel(day, true) : "No due date",
            timeDetail: t.dueAt ? `Due ${formatTime(t.dueAt, tz)} · ${zone}` : "—",
            home,
            description: t.description,
            // No required form fields: finish from the panel (submitTaskAction).
            canComplete:
              status !== "completed" &&
              t.status !== "submitted" &&
              t.version !== undefined &&
              !(t.fields ?? []).some((f) => f.required),
          },
        },
      ];
    });
    return { tasks, loadedAt: now };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) sessionEnded(error);
    return { tasks: [], error: errorMessage(error) };
  }
}
