// All staff column header (Figma "Staff Table Header" 103:17743): slate-50, slate-200 bottom
// border, 16 × 12 padding, 16px gaps, Inter Medium 12/17 slate-500. Columns are shared with
// StaffRow and StaffRowSkeleton. Phones show name, status and ⋯ only (no header); role from md,
// ID and date from lg, homes from xl.
export const STAFF_TABLE_COLUMNS = {
  staff: "min-w-0 flex-1 md:w-65 md:flex-none md:shrink-0",
  staffId: "hidden w-22.5 shrink-0 lg:flex",
  role: "hidden w-35 shrink-0 md:flex",
  homes: "hidden w-47.5 shrink-0 xl:flex",
  status: "flex shrink-0 md:w-37.5",
  added: "hidden w-27.5 shrink-0 lg:flex",
  actions: "flex shrink-0 justify-end md:min-w-px md:flex-1",
};

const LABEL = "type-ui-12-17 font-medium text-slate-500";

export function StaffTableHeader() {
  const c = STAFF_TABLE_COLUMNS;
  return (
    <div className="hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 md:flex">
      <span className={`${c.staff} ${LABEL}`}>Staff name</span>
      <span className={`${c.staffId} ${LABEL}`}>Staff ID</span>
      <span className={`${c.role} ${LABEL}`}>Role</span>
      <span className={`${c.homes} ${LABEL}`}>Assigned homes</span>
      <span className={`${c.status} ${LABEL}`}>Status</span>
      <span className={`${c.added} ${LABEL}`}>Date added</span>
      <span className={`${c.actions} ${LABEL}`}>Actions</span>
    </div>
  );
}
