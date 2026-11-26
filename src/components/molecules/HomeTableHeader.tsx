// My homes column header (Figma "Column header" 60:12885): slate-50, 16 × 10 padding, 16px gaps,
// Inter Medium 12/18 slate-500, a 40px gap over the home icons. Columns are shared with HomeRow.
export const HOME_TABLE_COLUMNS = {
  icon: "w-10 shrink-0",
  home: "min-w-0 flex-1 md:w-53.5 md:flex-none md:shrink-0",
  address: "hidden w-75 shrink-0 md:flex",
  assignment: "shrink-0 md:w-37.5",
  role: "hidden min-w-0 flex-1 lg:flex",
  action: "shrink-0 justify-end md:ml-auto md:w-27.5",
};

const HEADER = "type-ui-12 font-medium text-slate-500";

export function HomeTableHeader() {
  return (
    <div className="hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
      <span className={HOME_TABLE_COLUMNS.icon} />
      <span className={`${HOME_TABLE_COLUMNS.home} ${HEADER}`}>Home</span>
      <span className={`${HOME_TABLE_COLUMNS.address} ${HEADER}`}>Address</span>
      <span className={`${HOME_TABLE_COLUMNS.assignment} ${HEADER}`}>Assignment</span>
      <span className={`${HOME_TABLE_COLUMNS.role} ${HEADER}`}>Role</span>
      <span className={HOME_TABLE_COLUMNS.action} />
    </div>
  );
}
