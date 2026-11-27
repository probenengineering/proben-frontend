import { cn } from "@/lib/utils";

// A row in "Review changes" (Figma "Row / Homes added" 103:20015): 12px vertical padding, 12px gap,
// slate-200 divider. Label (Inter 13/18 slate-500) over the homes (Medium 14/20 slate-900; "None"
// when empty), then the count (Semi Bold 18/26): verified-700 added, grey-700 kept, danger-600
// removed.
export interface ChangeSummaryRowProps {
  label: string;
  homes: string[];
  tone: "added" | "kept" | "removed";
  divider?: boolean;
}

const TONE = {
  added: "text-verified-700",
  kept: "text-grey-700",
  removed: "text-danger-600",
};

export function ChangeSummaryRow({ label, homes, tone, divider }: ChangeSummaryRowProps) {
  return (
    <div
      className={cn("flex w-full items-center gap-3 py-3", divider && "border-b border-slate-200")}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="type-ui-13 text-slate-500">{label}</span>
        <span className="type-ui-14 font-medium text-slate-900">
          {homes.length ? homes.join(", ") : "None"}
        </span>
      </div>
      <span className={cn("type-ui-18-26 font-semibold", TONE[tone])}>{homes.length}</span>
    </div>
  );
}
