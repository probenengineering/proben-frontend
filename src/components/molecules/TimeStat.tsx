import { cn } from "@/lib/utils";

// Label above a value, e.g. "Scheduled shift / 8:00 AM – 4:00 PM".
// "inline" puts label and value on one row (Figma "Clock-in time   00 : 00").
export interface TimeStatProps {
  label: string;
  value: string;
  layout?: "stacked" | "inline";
  align?: "start" | "end";
  /** Greyed-out value and lighter label, used before clocking in. */
  muted?: boolean;
  className?: string;
}

export function TimeStat({
  label,
  value,
  layout = "stacked",
  align = "start",
  muted,
  className,
}: TimeStatProps) {
  return (
    <div
      className={cn(
        "flex whitespace-nowrap",
        layout === "inline" ? "w-full items-center justify-between" : "flex-col gap-3",
        layout === "stacked" && (align === "end" ? "items-end" : "items-start"),
        className,
      )}
    >
      <span className={cn("type-paragraph-sm", muted ? "text-label" : "text-black-60")}>
        {label}
      </span>
      <span className={cn("type-title-md font-semibold", muted ? "text-black-50" : "text-black")}>
        {value}
      </span>
    </div>
  );
}
