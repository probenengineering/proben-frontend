import { STAFF_TABLE_COLUMNS as C } from "./StaffTableHeader";

// Loading row of the All staff table (Figma "Skeleton row" 103:18545): 16 × 14 padding, 16px gaps,
// slate-200 divider. 40px circle; name bar 10px (6px radius) over email bar 8px (slate-100, 4px
// radius), 6px apart; ID 60 × 10; role 80 × 18 (6px radius); homes 130 × 10; status 70 × 20 pill;
// date 80 × 10. Bars are skeleton-grid. Name and email widths shrink down the list.
export interface StaffRowSkeletonProps {
  nameWidth: number;
  emailWidth: number;
}

const BAR = "bg-skeleton-grid";

export function StaffRowSkeleton({ nameWidth, emailWidth }: StaffRowSkeletonProps) {
  return (
    <li
      aria-hidden
      className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-3.5"
    >
      <span className={`flex h-10 items-center gap-3 ${C.staff}`}>
        <span className={`size-10 shrink-0 rounded-full ${BAR}`} />
        <span className="flex flex-col gap-1.5">
          <span className={`h-2.5 rounded-[6px] ${BAR}`} style={{ width: nameWidth }} />
          <span className="h-2 rounded-[4px] bg-slate-100" style={{ width: emailWidth }} />
        </span>
      </span>
      <span className={`h-5 items-center ${C.staffId}`}>
        <span className={`h-2.5 w-15 rounded-[5px] ${BAR}`} />
      </span>
      <span className={`h-5 items-center ${C.role}`}>
        <span className={`h-4.5 w-20 rounded-[6px] ${BAR}`} />
      </span>
      <span className={`h-5 items-center ${C.homes}`}>
        <span className={`h-2.5 w-32.5 rounded-[5px] ${BAR}`} />
      </span>
      <span className={`h-5 items-center ${C.status}`}>
        <span className={`h-5 w-17.5 rounded-full ${BAR}`} />
      </span>
      <span className={`h-5 items-center ${C.added}`}>
        <span className={`h-2.5 w-20 rounded-[5px] ${BAR}`} />
      </span>
    </li>
  );
}
