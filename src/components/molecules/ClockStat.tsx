import { cn } from "@/lib/utils";

// One stat in the v2 "My time" card (Figma "Stat / Clock-in" etc.): Inter 13/18 slate-500 label,
// Inter Semi Bold 15/22 value. "empty" = the grey "—"; "danger" = "Was due 4:00 PM" in overtime.
export interface ClockStatProps {
  label: string;
  value: string;
  tone?: "default" | "empty" | "danger";
}

const valueTones = {
  default: "text-slate-900",
  empty: "text-grey-400",
  danger: "text-danger-700",
};

export function ClockStat({ label, value, tone = "default" }: ClockStatProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 whitespace-nowrap">
      <span className="type-ui-13 text-slate-500">{label}</span>
      <span className={cn("type-ui-15 font-semibold", valueTones[tone])}>{value}</span>
    </div>
  );
}
