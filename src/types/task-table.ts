import type { Priority } from "@/components/atoms";

import type { ScheduleItem } from "./schedule";

// One row of the My tasks table (Figma 60:11012), mapped from GET /tasks.

/** A form field the task asks for (GET /tasks `fields`). */
export interface TaskField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "file";
  required: boolean;
}

export type TaskAnswers = Record<string, string | number | boolean | null>;

export type TaskTableStatus =
  "overdue" | "needs_attention" | "in_progress" | "upcoming" | "completed";

export interface TaskTableItem {
  id: string;
  title: string;
  subtitle?: string;
  /** API `source`, e.g. "training_policies". */
  source?: string;
  priority: Priority;
  /** "Oct 22, 2026". */
  dueDate?: string;
  /** "3 days overdue" / "Tomorrow" / "In 5 days". */
  dueRelative?: string;
  dueTone: "overdue" | "soon" | "later";
  /** Epoch ms for sorting; Infinity when there's no due date. */
  dueAt: number;
  /** Epoch ms the task was created, for "Sort: Recent". */
  createdAt: number;
  status: TaskTableStatus;
  /** Completed tasks: "Oct 20, 2026" and "On time" / "1 day late"; epoch ms for "Most recent". */
  completedDate?: string;
  completedRelative?: string;
  completedLate?: boolean;
  completedAt: number;
  /** "Mark as complete" (no required form fields): optimistic-lock version and whether started. */
  version?: number;
  started: boolean;
  /** Task drawer (Figma 60:11701): "Oct 14, 2026" assigned, form fields, saved answers, uploads. */
  assignedDate?: string;
  /** Started tasks with saved answers: "Oct 24, 4:12 PM" and "Oct 24" (from updatedAt). */
  draftSavedAt?: string;
  draftDay?: string;
  fields: TaskField[];
  answers: TaskAnswers;
  attachmentIds: string[];
  /** For the detail panel. */
  item: ScheduleItem;
}

export interface TaskTableData {
  tasks: TaskTableItem[];
  /** Epoch ms the tasks were loaded ("Showing tasks saved at 10:42 AM" when offline). */
  loadedAt?: number;
  error?: string;
}
