// Column titles for the task table (Figma 51:10883). Columns at 1108px: 380 · 380 · 147 · 147 ·
// 54; the first two share whatever width is left. Hidden below sm, where rows stack.
export const TASK_TABLE_COLUMNS = "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_147px_147px_54px]";

export interface TaskTableHeaderProps {
  /** "Due time" (default) or "Due date" (overdue group, Figma 51:11043). */
  timeLabel?: string;
}

export function TaskTableHeader({ timeLabel = "Due time" }: TaskTableHeaderProps) {
  return (
    <div
      className={`hidden h-11.5 items-center border-b border-white-200 bg-white type-paragraph-sm font-sans! text-black-60 sm:grid ${TASK_TABLE_COLUMNS}`}
    >
      <span className="pr-2 pl-5">Task name</span>
      <span className="px-3">Description</span>
      <span className="px-10 whitespace-nowrap">{timeLabel}</span>
      <span className="px-10 text-center">Status</span>
      <span />
    </div>
  );
}
