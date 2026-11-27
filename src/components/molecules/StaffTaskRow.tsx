"use client";

import { InitialsAvatar, PriorityLabel, StatePill, type StatePillTone } from "@/components/atoms";
import { STAFF_TINT_CLASSES } from "@/lib/staff";
import {
  dueHint,
  formatDay,
  isEditableTask,
  isOpenTask,
  type StaffTask,
  TASK_STATE_LABELS,
  type StaffTaskState,
  taskState,
} from "@/lib/staff-tasks";
import { cn } from "@/lib/utils";

import { type RowAction, RowActionMenu } from "./RowActionMenu";
import { STAFF_TASK_COLUMNS as C } from "./StaffTaskTableHeader";

// One task in Staff tasks (Figma "Task Admin Row" 103:20211): slate-200 divider, 16 × 12 padding,
// 16px gaps. Title Semi Bold 14/20 slate-900 over the description (12/17 slate-500), both
// truncated; 32px avatar + name (Medium 13/18 grey-700); home (13/18 grey-700, "No home" in
// grey-400); priority; due date (13/18 grey-700 over a 12/17 slate-500 hint; both danger-600 when
// overdue); status pill; ⋯. A just-assigned task is green-500/8 (103:20387). The title opens the
// task. The ⋯ menu has no Figma frame (row menu style); without task authority it only has View.
export type StaffTaskAction = "view" | "edit" | "reassign" | "cancel";

// Waiting for review and Cancelled have no Figma pill; they reuse In progress's and Upcoming's.
const TONES: Record<StaffTaskState, StatePillTone> = {
  overdue: "danger",
  "in-progress": "info",
  submitted: "info",
  "needs-attention": "warning",
  upcoming: "neutral",
  cancelled: "neutral",
  completed: "success",
};

const VIEW: RowAction<StaffTaskAction> = {
  action: "view",
  icon: "menu-task-18",
  label: "View task",
};
const EDIT: RowAction<StaffTaskAction>[] = [
  { action: "edit", icon: "menu-edit-18", label: "Edit task" },
  { action: "reassign", icon: "menu-people-18", label: "Reassign" },
];
const CANCEL: RowAction<StaffTaskAction> = {
  action: "cancel",
  icon: "info-red-18",
  label: "Cancel task",
  danger: true,
};

export interface StaffTaskRowProps {
  task: StaffTask;
  highlighted?: boolean;
  /** You can assign tasks: Edit, Reassign (open tasks) and Cancel (unfinished ones). */
  manage?: boolean;
  onAction: (action: StaffTaskAction, task: StaffTask) => void;
}

export function StaffTaskRow({ task, highlighted, manage, onAction }: StaffTaskRowProps) {
  const state = taskState(task);
  const hint = dueHint(task);
  const items = [
    VIEW,
    ...(manage && isEditableTask(task) ? EDIT : []),
    ...(manage && isOpenTask(task) ? [CANCEL] : []),
  ];
  return (
    <li
      className={cn(
        "flex items-center gap-3 border-b border-slate-200 px-4 py-3 transition-colors duration-150 md:gap-4",
        highlighted ? "bg-green-500/8" : "bg-white hover:bg-slate-50/70",
      )}
    >
      <button
        type="button"
        onClick={() => onAction("view", task)}
        className={cn("flex flex-col gap-0.5 text-left", C.task)}
      >
        <span className="truncate type-ui-14 font-semibold text-slate-900 hover:underline">
          {task.title}
        </span>
        <span className="truncate type-ui-12-17 text-slate-500 max-sm:hidden">
          {task.description}
        </span>
        {/* Phones hide the Assigned to and Due columns: who and when go under the title. */}
        <span
          className={cn(
            "truncate type-ui-12-17 sm:hidden",
            hint.late ? "text-danger-600" : "text-slate-500",
          )}
        >
          {`${task.assignee.name} · ${hint.late ? hint.text : `Due ${formatDay(task.due)}`}`}
        </span>
      </button>
      <span className={cn("min-w-0 items-center gap-2", C.assignee)}>
        <InitialsAvatar
          name={task.assignee.name}
          size={32}
          tintClassName={STAFF_TINT_CLASSES[task.assignee.tint]}
          photoSrc={task.assignee.photoSrc}
        />
        <span className="truncate type-ui-13 font-medium text-grey-700">{task.assignee.name}</span>
      </span>
      <span className={cn("min-w-0 items-center", C.home)}>
        <span className={cn("truncate type-ui-13", task.home ? "text-grey-700" : "text-grey-400")}>
          {task.home ?? "No home"}
        </span>
      </span>
      <span className={cn("items-center", C.priority)}>
        <PriorityLabel priority={task.priority} />
      </span>
      <span
        className={cn("flex-col gap-0.5", C.due, hint.late ? "text-danger-600" : "text-grey-700")}
      >
        <span className="type-ui-13">{formatDay(task.due)}</span>
        <span className={cn("type-ui-12-17", !hint.late && "text-slate-500")}>{hint.text}</span>
      </span>
      <span className={cn("items-center", C.status)}>
        <StatePill tone={TONES[state]}>{TASK_STATE_LABELS[state]}</StatePill>
      </span>
      <span className={cn("items-center", C.actions)}>
        <RowActionMenu
          label={`Actions for ${task.title}`}
          items={items}
          onAction={(a) => onAction(a, task)}
        />
      </span>
    </li>
  );
}

export { TONES as TASK_STATE_TONES };
