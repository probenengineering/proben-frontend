import { cn } from "@/lib/utils";

// A label / value row in the clock-in / clock-out modal summaries (Figma "Row / Clock-in time"):
// Inter 14/20, slate-500 label, Semi Bold value, 10px vertical padding, optional bottom border.
// tone "success" = "Total worked" in verified-700.
export interface SummaryRowProps {
  label: string;
  value: string;
  divider?: boolean;
  tone?: "default" | "success";
}

export function SummaryRow({ label, value, divider, tone = "default" }: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center py-2.5 type-ui-14",
        divider && "border-b border-slate-200",
      )}
    >
      <span className="min-w-0 flex-1 text-slate-500">{label}</span>
      <span
        className={cn(
          "font-semibold whitespace-nowrap",
          tone === "success" ? "text-verified-700" : "text-slate-900",
        )}
      >
        {value}
      </span>
    </div>
  );
}
