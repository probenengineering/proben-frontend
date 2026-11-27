// Home assignments column header (Figma "Header" 103:20874): slate-50, slate-200 bottom border,
// 16 × 10 padding, 16px gaps, Inter Medium 12/17 slate-500. Columns are shared with
// HomeAssignmentRow. Phones: home, coverage and Manage (no header); staff from sm, city and
// manager from lg.
export const HOME_ASSIGNMENT_COLUMNS = {
  home: "min-w-0 flex-1 md:w-67.5 md:flex-none md:shrink-0",
  city: "hidden w-32.5 shrink-0 lg:flex",
  staff: "hidden w-52.5 shrink-0 sm:flex",
  manager: "hidden w-42.5 shrink-0 lg:flex",
  coverage: "hidden w-37.5 shrink-0 md:flex",
  actions: "flex shrink-0 justify-end md:min-w-px md:flex-1",
};

const LABEL = "type-ui-12-17 font-medium text-slate-500";

export function HomeAssignmentTableHeader() {
  const c = HOME_ASSIGNMENT_COLUMNS;
  return (
    <div className="hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
      <span className={`${c.home} ${LABEL}`}>Home</span>
      <span className={`${c.city} ${LABEL}`}>City</span>
      <span className={`${c.staff} ${LABEL}`}>Assigned staff</span>
      <span className={`${c.manager} ${LABEL}`}>Home manager</span>
      <span className={`${c.coverage} ${LABEL}`}>Coverage</span>
      <span className={`${c.actions} ${LABEL}`}>Actions</span>
    </div>
  );
}
