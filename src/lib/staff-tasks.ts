import type { Priority } from "@/components/atoms";

import type { StaffTint } from "./staff";

// Staff tasks (Figma 103:20163): the screen's task shape, filters, sorts, labels and due hints.
// Tasks come from Command Center's admin list (GET /admin/tasks); the API → task mapping is in
// lib/staff-api/task-mappers.

export type StaffTaskStatus =
  "upcoming" | "in-progress" | "submitted" | "needs-attention" | "completed" | "cancelled";
export type StaffTaskState = StaffTaskStatus | "overdue";

export interface StaffTask {
  id: string;
  /** Optimistic-lock version, sent back with Cancel. */
  version: number;
  title: string;
  description: string;
  instructions: string[];
  assignee: { id: string; name: string; tint: StaffTint; photoSrc?: string };
  home?: string;
  priority: Priority;
  /** ISO instant. */
  due: string;
  status: StaffTaskStatus;
  /** Past due and unfinished (the API's isOverdue flag; it can overlap a status). */
  overdue: boolean;
  assignedBy: string;
  /** ISO instant. */
  assignedOn: string;
  startedOn?: string;
  submittedOn?: string;
  /** The submitted answers as "Label: value" lines. */
  response?: string;
  /** Review feedback when changes were requested. */
  feedback?: string;
  referenceUrl?: string;
  /** Reference file ids; opened through our file proxy (/api/files/<id>). */
  referenceFiles: string[];
}

export type StaffTaskFilter = "none" | StaffTaskState;
export type StaffTaskSort = "due-asc" | "due-desc" | "priority" | "assignee";

export const STAFF_TASK_FILTERS: { id: StaffTaskFilter; label: string }[] = [
  { id: "none", label: "None" },
  { id: "overdue", label: "Overdue" },
  { id: "in-progress", label: "In progress" },
  { id: "needs-attention", label: "Needs attention" },
  { id: "submitted", label: "Waiting for review" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export const STAFF_TASK_SORTS: { id: StaffTaskSort; label: string }[] = [
  { id: "due-asc", label: "Due date" },
  { id: "due-desc", label: "Due date (latest)" },
  { id: "priority", label: "Priority" },
  { id: "assignee", label: "Assigned to" },
];

/** Rows per page (Figma 103:20163). */
export const STAFF_TASK_PAGE_SIZE = 6;

/** Overdue wins over the status while the task is still open. */
export function taskState(task: StaffTask): StaffTaskState {
  if (task.status === "completed" || task.status === "cancelled") return task.status;
  return task.overdue ? "overdue" : task.status;
}

/** Not finished: it can still be cancelled. */
export const isOpenTask = (task: StaffTask) =>
  task.status !== "completed" && task.status !== "cancelled";

/** Editable by the backend's rules (submitted, completed and cancelled tasks aren't). */
export const isEditableTask = (task: StaffTask) =>
  task.status === "upcoming" || task.status === "in-progress" || task.status === "needs-attention";

export const TASK_STATE_LABELS: Record<StaffTaskState, string> = {
  upcoming: "Upcoming",
  "in-progress": "In progress",
  submitted: "Waiting for review",
  "needs-attention": "Needs attention",
  completed: "Completed",
  cancelled: "Cancelled",
  overdue: "Overdue",
};

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const time = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const formatDateTime = (iso: string) => `${formatDay(iso)}, ${time(new Date(iso))}`;

/** Second line under the due date: "Overdue by 4 days", "Tomorrow, 12:00 PM", "Due in 2 days", "5:00 PM". */
export function dueHint(task: StaffTask, now = new Date()) {
  const due = new Date(task.due);
  const days = Math.round((day(due) - day(now)) / 86_400_000);
  if (taskState(task) === "overdue") {
    const late = Math.max(1, -days);
    return {
      text: days >= 0 ? "Overdue today" : `Overdue by ${late} ${late === 1 ? "day" : "days"}`,
      late: true,
    };
  }
  if (days === 0) return { text: `Today, ${time(due)}`, late: false };
  if (days === 1) return { text: `Tomorrow, ${time(due)}`, late: false };
  if (days <= 3 && days > 1) return { text: `Due in ${days} days`, late: false };
  return { text: time(due), late: false };
}
