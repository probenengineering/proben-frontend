import type { ReactNode } from "react";

import { Icon } from "@/components/atoms";

// All staff with nobody yet (Figma "Empty state" 103:18493): fills the page, slate-50 with a
// dashed slate-200 border, 16px radius (no radius token yet), content centred 16px apart. 64px
// green-500/14 circle with the 28px people icon; "No staff members yet" (Inter Semi Bold 18/26
// slate-900) over the hint (14/20 slate-500), 6px apart; then the Add staff button (`action`).
export interface StaffEmptyProps {
  action: ReactNode;
}

export function StaffEmpty({ action }: StaffEmptyProps) {
  return (
    <div className="flex min-h-80 w-full flex-1 flex-col items-center justify-center gap-4 rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-green-500/14">
        <Icon name="empty-people-28" size={28} />
      </span>
      <span className="flex flex-col gap-1.5">
        <span className="type-ui-18-26 font-semibold text-slate-900">No staff members yet</span>
        <span className="type-ui-14 text-slate-500">
          Add your first staff member to start building your team.
        </span>
      </span>
      {action}
    </div>
  );
}
