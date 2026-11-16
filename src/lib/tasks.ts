import type { TaskRowProps } from "@/components/molecules";
import type { TaskGroupProps } from "@/components/organisms/TaskGroup";

import { formatClockTime } from "./shift-clock/format";

// Task list grouping and the "Due soon" filter (Figma 51:10883, 51:11193, 51:11043).
// Pure functions so the same rules can move to the API later (docs/command-center.md §3).

export type TaskRecordStatus = "pending" | "in-progress" | "completed";

export interface TaskRecord {
  id: string;
  name: string;
  description: string;
  /** Local date-time, "2026-10-28T08:00". */
  due: string;
  status: TaskRecordStatus;
}

export type TaskFilter = "to-do" | "due-later" | "overdue" | "in-progress" | "completed";

export const TASK_FILTERS: { id: TaskFilter; label: string }[] = [
  { id: "to-do", label: "To do" },
  { id: "due-later", label: "Due later" },
  { id: "overdue", label: "Over due" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

const dayKey = (iso: string) => iso.slice(0, 10);

function addDays(key: string, days: number) {
  const date = new Date(`${key}T00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const format = (key: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", options).format(new Date(`${key}T00:00`));

/** Which filter a task falls under. Overdue = not completed and due before today. */
export function bucketOf(task: TaskRecord, today: string): TaskFilter {
  if (task.status === "completed") return "completed";
  if (dayKey(task.due) < today) return "overdue";
  if (task.status === "in-progress") return "in-progress";
  return dayKey(task.due) > addDays(today, 1) ? "due-later" : "to-do";
}

/**
 * Groups for the list. No filter ticked = "Due soon": everything due today or tomorrow.
 * Otherwise the ticked buckets, with overdue tasks first in one "Over due" group (newest first,
 * showing the due date), then one group per day.
 */
export function groupTasks(
  tasks: TaskRecord[],
  filters: TaskFilter[],
  today: string,
): TaskGroupProps[] {
  const tomorrow = addDays(today, 1);
  const shown = tasks.filter((task) =>
    filters.length === 0
      ? dayKey(task.due) >= today && dayKey(task.due) <= tomorrow
      : filters.includes(bucketOf(task, today)),
  );

  const overdue = shown
    .filter((task) => bucketOf(task, today) === "overdue")
    .sort((a, b) => b.due.localeCompare(a.due));
  const byDay = new Map<string, TaskRecord[]>();
  for (const task of shown.filter((t) => bucketOf(t, today) !== "overdue")) {
    const key = dayKey(task.due);
    byDay.set(key, [...(byDay.get(key) ?? []), task]);
  }

  const groups: TaskGroupProps[] = [];
  if (overdue.length > 0) {
    groups.push({
      title: "Over due",
      available: overdue.length,
      timeLabel: "Due date",
      tasks: overdue.map((task) => ({
        ...toRow(task, "overdue"),
        time: format(dayKey(task.due), { month: "short", day: "numeric", year: "numeric" }),
      })),
    });
  }
  for (const [key, dayTasks] of [...byDay].sort(([a], [b]) => a.localeCompare(b))) {
    groups.push({
      title:
        key === today ? "Today" : key === tomorrow ? "Tomorrow" : format(key, { weekday: "long" }),
      date: format(key, { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      available: dayTasks.length,
      tasks: dayTasks
        .sort((a, b) => a.due.localeCompare(b.due))
        .map((task) => toRow(task, task.status)),
    });
  }
  return groups;
}

function toRow(task: TaskRecord, status: TaskRowProps["status"]): TaskRowProps {
  return {
    name: task.name,
    description: task.description,
    time: formatClockTime(new Date(task.due).getTime()),
    status,
  };
}
