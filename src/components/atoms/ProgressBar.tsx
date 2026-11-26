import { cn } from "@/lib/utils";

// Day popover progress (Figma 60:7523): 6px slate-100 track, green-500 fill, both fully rounded.
export interface ProgressBarProps {
  /** 0–1. */
  value: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-clip rounded-full bg-slate-100", className)}
    >
      <div
        className="h-full rounded-full bg-green-500 transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
