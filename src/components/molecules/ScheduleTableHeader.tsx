import { Checkbox } from "@/components/atoms";

// Schedule list column header (Figma "Column header" 60:6885): select-all box, bar gap, then
// Task (flex), Time (170px), Type (150px), Status (120px), actions (52px), Inter Medium 12/18
// slate-500. Time and Type hide below md, like the rows.
const COLUMNS = [
  { label: "Time", className: "hidden w-42.5 md:block" },
  { label: "Type", className: "hidden w-37.5 md:block" },
  { label: "Status", className: "w-30" },
];

export function ScheduleTableHeader() {
  return (
    <li className="flex w-full items-center gap-4 border-b border-slate-200 px-4 py-3 type-ui-12 font-medium text-slate-500">
      {/* Bulk selection isn't built yet. */}
      <Checkbox
        aria-label="Select all"
        disabled
        className="size-5 rounded-[6px] border-[1.5px] border-grey-300 data-disabled:opacity-100"
      />
      <span className="w-[3px]" />
      <span className="flex-1">Task</span>
      {COLUMNS.map((c) => (
        <span key={c.label} className={c.className}>
          {c.label}
        </span>
      ))}
      <span className="w-13" />
    </li>
  );
}
