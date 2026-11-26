import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Figma "Status Pill" (60:5185) from the v2 dashboard: 999px pill, 6px dot, Inter Medium 12/18.
// Used for the "My time" status ("Clocked in", "On break") and agenda items ("Upcoming").
// The older StatusPill (24px radius, 10px text) is a different Figma component.
const tones = {
  neutral: { pill: "bg-slate-100 text-grey-700", dot: "bg-grey-400" },
  success: { pill: "bg-verified-50 text-verified-700", dot: "bg-verified-500" },
  warning: { pill: "bg-caution-50 text-caution-700", dot: "bg-caution-500" },
  danger: { pill: "bg-danger-50 text-danger-700", dot: "bg-danger-500" },
  info: { pill: "bg-info-50 text-info-700", dot: "bg-info-500" },
};

export type StatePillTone = keyof typeof tones;

export interface StatePillProps {
  children: ReactNode;
  tone?: StatePillTone;
  className?: string;
}

export function StatePill({ children, tone = "neutral", className }: StatePillProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full py-[3px] pr-2.5 pl-2 type-ui-12 font-medium whitespace-nowrap",
        tones[tone].pill,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", tones[tone].dot)} aria-hidden />
      {children}
    </span>
  );
}
