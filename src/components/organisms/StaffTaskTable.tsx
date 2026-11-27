"use client";

import {
  StaffTaskRow,
  StaffTaskTableHeader,
  type StaffTaskAction,
  TablePagination,
} from "@/components/molecules";
import type { StaffTaskFilters } from "@/hooks/useStaffTaskFilters";
import type { StaffTask } from "@/lib/staff-tasks";
import { cn } from "@/lib/utils";

// Staff tasks table (Figma "Task table" 103:20209): white, slate-200 border, 12px radius (no
// radius token yet). Column header, one StaffTaskRow per task on this page, then "Showing 1–6 of
// 8 tasks" with Previous / Next. The rows stay while the next page loads (aria-busy).
export interface StaffTaskTableProps {
  filters: StaffTaskFilters;
  highlighted: string | null;
  /** You can assign tasks (row menus get Edit, Reassign and Cancel). */
  manage?: boolean;
  onAction: (action: StaffTaskAction, task: StaffTask) => void;
}

export function StaffTaskTable({ filters: f, highlighted, manage, onAction }: StaffTaskTableProps) {
  return (
    <div
      aria-busy={f.loading || undefined}
      className="w-full overflow-clip rounded-[12px] border border-slate-200 bg-white"
    >
      <StaffTaskTableHeader />
      {/* While the next page / search loads, the rows dim (after 150ms, so quick answers don't flicker). */}
      <ul
        className={cn(
          "flex w-full flex-col transition-opacity duration-200 motion-reduce:transition-none",
          f.loading && "opacity-60 delay-150",
        )}
      >
        {f.rows.map((task) => (
          <StaffTaskRow
            key={task.id}
            task={task}
            highlighted={task.id === highlighted}
            manage={manage}
            onAction={onAction}
          />
        ))}
        {f.rows.length === 0 && (
          <li className="border-b border-slate-200 px-4 py-6 text-center type-ui-13 text-slate-500">
            {f.narrowed ? "No tasks match your search." : "No tasks have been assigned yet."}
          </li>
        )}
      </ul>
      <TablePagination
        summary={`Showing ${f.from}–${f.to} of ${f.total} ${f.total === 1 ? "task" : "tasks"}`}
        hasPrevious={f.hasPrevious}
        hasNext={f.hasNext}
        onPrevious={f.previous}
        onNext={f.next}
      />
    </div>
  );
}
