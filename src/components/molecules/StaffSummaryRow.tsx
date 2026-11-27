import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// A label / value row (Figma "Row / Staff ID" 103:18896): 10px vertical padding, 12px gap,
// slate-200 divider; 140px (or 120px) label (Inter 13/18 slate-500), then the value: text in
// Inter Medium 14/20 slate-900, or a tag / pill. `roomy` = 11px padding (task drawer details,
// 103:20293).
export interface StaffSummaryRowProps {
  label: string;
  children: ReactNode;
  divider?: boolean;
  /** 120px label (profile Contact & employment, 103:19003) instead of 140px. */
  narrow?: boolean;
  roomy?: boolean;
}

export function StaffSummaryRow({ label, children, divider, narrow, roomy }: StaffSummaryRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3",
        roomy ? "py-[11px]" : "py-2.5",
        divider && "border-b border-slate-200",
      )}
    >
      <dt className={cn("shrink-0 type-ui-13 text-slate-500", narrow ? "w-30" : "w-35")}>
        {label}
      </dt>
      <dd className="min-w-0 flex-1 type-ui-14 font-medium text-slate-900">{children}</dd>
    </div>
  );
}
