"use client";

import {
  type StaffRowAction,
  StaffRow,
  StaffRowSkeleton,
  StaffTableHeader,
  TablePagination,
} from "@/components/molecules";
import type { StaffFilters } from "@/hooks/useStaffFilters";
import type { StaffMember } from "@/lib/staff";
import { cn } from "@/lib/utils";

// All staff table (Figma "Staff table" 103:18398): white, slate-200 border, 12px radius (no
// radius token yet). Column header, one StaffRow per person on this page, then the pagination
// row. Loading (103:18543): six skeleton rows and "Loading staff…". A search or filter with no
// matches shows a line instead of rows.
export interface StaffTableProps {
  filters?: StaffFilters;
  canManage?: boolean;
  canAssignTasks?: boolean;
  onAction?: (action: StaffRowAction, staff: StaffMember) => void;
}

const SKELETON = [
  [120, 150],
  [114, 146],
  [108, 142],
  [102, 138],
  [96, 134],
  [90, 130],
];

export function StaffTable({
  filters: f,
  canManage,
  canAssignTasks,
  onAction = () => {},
}: StaffTableProps) {
  return (
    <div
      aria-busy={f?.loading}
      className="w-full overflow-clip rounded-[12px] border border-slate-200 bg-white"
    >
      <StaffTableHeader />
      {/* While the next page / search loads, the rows dim (after 150ms, so quick answers don't flicker). */}
      <ul
        className={cn(
          "flex w-full flex-col transition-opacity duration-200 motion-reduce:transition-none",
          f?.loading && "opacity-60 delay-150",
        )}
      >
        {f
          ? f.rows.map((staff) => (
              <StaffRow
                key={staff.id}
                staff={staff}
                canManage={canManage}
                canAssignTasks={canAssignTasks}
                onAction={onAction}
              />
            ))
          : SKELETON.map(([name, email], i) => (
              <StaffRowSkeleton key={i} nameWidth={name} emailWidth={email} />
            ))}
        {f && f.rows.length === 0 && (
          <li className="border-b border-slate-200 px-4 py-6 text-center type-ui-13 text-slate-500">
            No staff match your search.
          </li>
        )}
      </ul>
      <TablePagination
        summary={f ? `Showing ${f.from}–${f.to} of ${f.total} staff` : "Loading staff…"}
        hasPrevious={f?.hasPrevious}
        hasNext={f?.hasNext}
        onPrevious={f?.previous}
        onNext={f?.next}
      />
    </div>
  );
}
