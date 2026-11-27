import type { StaffTask, StaffTaskFilter, StaffTaskSort, StaffTaskStatus } from "@/lib/staff-tasks";

import type { AdminTaskQuery } from "./api";
import { photoFromAvatarUrl, tintFor } from "./mappers";
import type { ApiAdminTask, ApiAdminTaskStatus, ApiTaskSort } from "./types";

// Command Center admin task → Staff tasks row (Figma 103:20211) and drawer (103:20282). Safe on
// server and client.

const STATUS: Record<ApiAdminTaskStatus, StaffTaskStatus> = {
  upcoming: "upcoming",
  in_progress: "in-progress",
  submitted: "submitted",
  needs_attention: "needs-attention",
  completed: "completed",
  cancelled: "cancelled",
};

/** Filter → GET /admin/tasks `status` ("overdue" is a flag the API filters on too). */
export const FILTER_TO_API: Record<StaffTaskFilter, AdminTaskQuery["status"]> = {
  none: undefined,
  overdue: "overdue",
  upcoming: "upcoming",
  "in-progress": "in_progress",
  submitted: "submitted",
  "needs-attention": "needs_attention",
  completed: "completed",
  cancelled: "cancelled",
};

export const SORT_TO_API: Record<StaffTaskSort, ApiTaskSort> = {
  "due-asc": "dueAt",
  "due-desc": "-dueAt",
  priority: "priority",
  assignee: "staff",
};

interface ApiField {
  key: string;
  label?: string;
  type?: string;
}

/** Submitted answers as "Label: value" lines (drafts aren't shown before submission). */
function responseOf(task: ApiAdminTask & { fields?: ApiField[] }) {
  if (!task.submittedAt) return undefined;
  const fields = task.fields ?? [];
  const lines = Object.entries(task.answers ?? {}).flatMap(([key, value]) => {
    if (value === null || value === undefined || value === "") return [];
    const field = fields.find((f) => f.key === key);
    const text =
      field?.type === "file"
        ? "File attached"
        : typeof value === "boolean"
          ? value
            ? "Yes"
            : "No"
          : Array.isArray(value)
            ? value.join(", ")
            : String(value);
    return [`${field?.label ?? key}: ${text}`];
  });
  const files = task.attachments?.length ?? 0;
  if (files > 0) lines.push(`${files} ${files === 1 ? "file" : "files"} attached`);
  // A task with nothing to fill in is submitted with no answers.
  return lines.length ? lines.join("\n") : "Submitted with no form answers.";
}

export function toStaffTask(t: ApiAdminTask): StaffTask {
  return {
    id: t.id,
    version: t.version,
    title: t.title,
    description: t.description ?? "",
    instructions: (t.instructions ?? []).filter((line) => line.trim()),
    assignee: {
      id: t.staffId,
      name: t.staff?.displayName?.trim() || "Unknown staff member",
      tint: tintFor(t.staffId),
      photoSrc: photoFromAvatarUrl(t.staff?.avatarUrl),
    },
    home: t.home ? (t.home.name ?? "Unknown home") : undefined,
    priority: t.priority,
    due: t.dueAt,
    status: STATUS[t.status] ?? "upcoming",
    overdue: !!t.isOverdue,
    assignedBy: t.assignedBy?.name ?? t.createdBy?.name ?? "Unknown",
    assignedOn: t.assignedAt ?? t.createdAt,
    startedOn: t.startedAt ?? undefined,
    submittedOn: t.submittedAt ?? undefined,
    response: responseOf(t),
    feedback: t.feedback?.trim() || undefined,
    referenceUrl: t.referenceUrl ?? undefined,
    referenceFiles: t.referenceFileIds ?? [],
  };
}
