import { cn } from "@/lib/utils";

// Group band in the Schedule list (Figma "Day Group Header" 60:5157 / "Group / Overdue"):
// slate-50 band ("Thursday, 25 Oct" + green "Today" pill) or danger-50 for "Overdue", with the
// count on the right ("6 tasks", "No tasks").
export interface ScheduleGroupHeaderProps {
  label: string;
  count: number;
  today?: boolean;
  overdue?: boolean;
}

export function ScheduleGroupHeader({ label, count, today, overdue }: ScheduleGroupHeaderProps) {
  return (
    <li
      className={cn(
        "flex w-full items-center gap-2 border-b border-slate-200 px-4 py-2.5",
        overdue ? "bg-danger-50" : "bg-slate-50",
      )}
    >
      <span
        className={cn(
          "type-ui-14 font-semibold whitespace-nowrap",
          overdue ? "text-danger-700" : "text-slate-900",
        )}
      >
        {label}
      </span>
      {today && (
        <span className="rounded-full bg-green-500 px-2 py-0.5 type-ui-12 font-medium text-white">
          Today
        </span>
      )}
      <span className="ml-auto type-ui-12 whitespace-nowrap text-slate-500">
        {count === 0 ? "No tasks" : `${count} ${count === 1 ? "task" : "tasks"}`}
      </span>
    </li>
  );
}
