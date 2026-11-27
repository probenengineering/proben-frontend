// Staff tasks column header (Figma "Task Table Header" 103:18249): slate-50, slate-200 bottom
// border, 16 × 12 padding, 16px gaps, Inter Medium 12/17 slate-500. Columns are shared with
// StaffTaskRow. Phones: task, assignee and status (no header); home and priority from lg, due
// date from md.
export const STAFF_TASK_COLUMNS = {
  task: "min-w-0 flex-1 lg:w-65 lg:flex-none lg:shrink-0",
  assignee: "hidden w-45 shrink-0 sm:flex",
  home: "hidden w-37.5 shrink-0 xl:flex",
  priority: "hidden w-22.5 shrink-0 lg:flex",
  due: "hidden w-32.5 shrink-0 md:flex",
  status: "flex shrink-0 md:w-32.5",
  actions: "flex shrink-0 justify-end lg:min-w-px lg:flex-1",
};

const LABEL = "type-ui-12-17 font-medium text-slate-500";

export function StaffTaskTableHeader() {
  const c = STAFF_TASK_COLUMNS;
  return (
    <div className="hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 md:flex">
      <span className={`${c.task} ${LABEL}`}>Task</span>
      <span className={`${c.assignee} ${LABEL}`}>Assigned to</span>
      <span className={`${c.home} ${LABEL}`}>Home</span>
      <span className={`${c.priority} ${LABEL}`}>Priority</span>
      <span className={`${c.due} ${LABEL}`}>Due date</span>
      <span className={`${c.status} ${LABEL}`}>Status</span>
      <span className={`${c.actions} ${LABEL}`}>Actions</span>
    </div>
  );
}
