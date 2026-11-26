import { cn } from "@/lib/utils";

// Day summary tile (Figma "Stat / Tasks" 60:8840): slate-50, 10px radius, 12 × 10 padding; value
// Inter Semi Bold 20/28 (verified-700 for "Done"), label Inter 12/18 slate-500.
export interface SummaryStatProps {
  value: number;
  label: string;
  tone?: "default" | "success";
}

export function SummaryStat({ value, label, tone = "default" }: SummaryStatProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-[10px] bg-slate-50 px-3 py-2.5">
      <span
        className={cn(
          "type-ui-20 font-semibold",
          tone === "success" ? "text-verified-700" : "text-slate-900",
        )}
      >
        {value}
      </span>
      <span className="type-ui-12 text-slate-500">{label}</span>
    </div>
  );
}
