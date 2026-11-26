import { Icon, PriorityLabel, SourceTag, StatePill, type StatePillTone } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { TaskTableItem, TaskTableStatus } from "@/types/task-table";

// My tasks row (Figma "Task / …" 60:11073): 16 × 14 padding, 16px gaps, slate-200 bottom border.
// Task (flex: Inter Medium 14/20 slate-900 + Regular 12/18 slate-500), Source (170px), Priority
// (96px), Due date (140px: Regular 14/20 + Medium 12/18 — red when overdue, caution-700 when due
// within 5 days, else slate-500), Status (132px), chevron (20px). Below md, Source and Priority hide
// and the row wraps: title and subtitle on top, due date and status underneath.
// Completed rows (Figma 60:11212) are muted: slate-500 title, grey-400 subtitle, source at 60%,
// priority "—", and the completion date with "On time" (verified-700) or "N days late" (slate-500).
export const TASK_STATUS: Record<TaskTableStatus, { label: string; tone: StatePillTone }> = {
  overdue: { label: "Overdue", tone: "danger" },
  needs_attention: { label: "Needs attention", tone: "warning" },
  in_progress: { label: "In progress", tone: "info" },
  upcoming: { label: "Upcoming", tone: "neutral" },
  completed: { label: "Completed", tone: "success" },
};

export const TASK_COLUMNS = {
  source: "hidden w-42.5 shrink-0 md:flex",
  priority: "hidden w-24 shrink-0 md:flex",
  due: "w-35 shrink-0",
  status: "w-33 shrink-0",
};

export interface TaskTableRowProps {
  task: TaskTableItem;
  onOpen: () => void;
  /** Open in the drawer (Figma 60:11764): green-tint with a 3px green-500 left edge. */
  selected?: boolean;
}

const NOTE_TONE = {
  overdue: "text-danger-700",
  soon: "text-caution-700",
  later: "text-slate-500",
};

function DateLines({
  date,
  note,
  dateClass,
  noteClass,
}: {
  date?: string;
  note?: string;
  dateClass: string;
  noteClass: string;
}) {
  if (!date) return <span className="type-ui-14 text-grey-400">—</span>;
  return (
    <>
      <span className={cn("type-ui-14", dateClass)}>{date}</span>
      {note && <span className={cn("type-ui-12 font-medium", noteClass)}>{note}</span>}
    </>
  );
}

export function TaskTableRow({ task, onOpen, selected }: TaskTableRowProps) {
  const done = task.status === "completed";
  return (
    <li className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left md:flex-nowrap",
          selected
            ? "bg-green-tint shadow-[inset_3px_0_0_var(--color-green-500)]"
            : "bg-white hover:bg-slate-50",
        )}
      >
        <span className="flex min-w-0 basis-full flex-col gap-0.5 md:flex-1 md:basis-auto">
          <span
            className={cn(
              "truncate type-ui-14 font-medium",
              done ? "text-slate-500" : "text-slate-900",
            )}
          >
            {task.title}
          </span>
          {task.subtitle && (
            <span className={cn("truncate type-ui-12", done ? "text-grey-400" : "text-slate-500")}>
              {task.subtitle}
            </span>
          )}
        </span>
        <span className={cn(TASK_COLUMNS.source, done && "opacity-60")}>
          {task.source && <SourceTag source={task.source} />}
        </span>
        <span className={TASK_COLUMNS.priority}>
          {done ? (
            <span className="type-ui-13 font-medium text-grey-400">—</span>
          ) : (
            <PriorityLabel priority={task.priority} />
          )}
        </span>
        <span className={cn("flex flex-col", TASK_COLUMNS.due)}>
          {done ? (
            <DateLines
              date={task.completedDate}
              note={task.completedRelative}
              dateClass="text-slate-500"
              noteClass={task.completedLate ? "text-slate-500" : "text-verified-700"}
            />
          ) : (
            <DateLines
              date={task.dueDate}
              note={task.dueRelative}
              dateClass={task.dueTone === "overdue" ? "text-danger-700" : "text-grey-700"}
              noteClass={NOTE_TONE[task.dueTone]}
            />
          )}
        </span>
        <span className={cn("flex", TASK_COLUMNS.status)}>
          <StatePill tone={TASK_STATUS[task.status].tone}>
            {TASK_STATUS[task.status].label}
          </StatePill>
        </span>
        <Icon name="chevron-right" size={20} className="hidden md:block" />
      </button>
    </li>
  );
}
