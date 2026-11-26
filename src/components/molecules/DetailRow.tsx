import { cn } from "@/lib/utils";

// A row in the Schedule detail panel's table (Figma "Detail / Date"): 110px Inter 13 slate-500
// label, Inter Medium 14 slate-900 value, 16px × 12px padding, slate-200 divider.
export interface DetailRowProps {
  label: string;
  value: string;
  divider?: boolean;
  /** Value colour override, e.g. "text-verified-700" for "Completed". */
  valueClassName?: string;
}

export function DetailRow({ label, value, divider, valueClassName }: DetailRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3",
        divider && "border-b border-slate-200",
      )}
    >
      <dt className="w-27.5 shrink-0 type-ui-13-20 text-slate-500">{label}</dt>
      <dd className={cn("min-w-0 flex-1 type-ui-14 font-medium text-slate-900", valueClassName)}>
        {value}
      </dd>
    </div>
  );
}
