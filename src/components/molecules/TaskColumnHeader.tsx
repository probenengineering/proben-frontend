import { TASK_COLUMNS } from "./TaskTableRow";

// My tasks column header (Figma "Column header" 60:11066): slate-50, 16 × 10 padding, 16px gaps,
// Inter Medium 12/18 slate-500. The date column reads "Completed" in the Completed view. Hidden
// on phones, where rows stack.
export interface TaskColumnHeaderProps {
  dateLabel?: string;
}

const HEADER = "type-ui-12 font-medium text-slate-500";

export function TaskColumnHeader({ dateLabel = "Due date" }: TaskColumnHeaderProps) {
  return (
    <div className="hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
      <span className={`flex-1 ${HEADER}`}>Task</span>
      <span className={`${TASK_COLUMNS.source} ${HEADER}`}>Source</span>
      <span className={`${TASK_COLUMNS.priority} ${HEADER}`}>Priority</span>
      <span className={`${TASK_COLUMNS.due} ${HEADER}`}>{dateLabel}</span>
      <span className={`${TASK_COLUMNS.status} ${HEADER}`}>Status</span>
      <span className="w-5" />
    </div>
  );
}
