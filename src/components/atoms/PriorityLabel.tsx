import { cn } from "@/lib/utils";

// Task priority (Figma "Priority", 60:11073): three 3px bars (4 / 7 / 10px tall, 1px radius) filled
// up to the level, unfilled bars grey-200, then Inter Medium 13/18. High = danger-600, Medium =
// caution-600 (2 bars), Low = slate-500 (1 bar).
const LEVELS = {
  high: { label: "High", bars: 3, tone: "text-danger-600", fill: "bg-danger-600" },
  medium: { label: "Medium", bars: 2, tone: "text-caution-600", fill: "bg-caution-600" },
  low: { label: "Low", bars: 1, tone: "text-slate-500", fill: "bg-slate-500" },
};

export type Priority = keyof typeof LEVELS;

export interface PriorityLabelProps {
  priority: Priority;
}

export function PriorityLabel({ priority }: PriorityLabelProps) {
  const level = LEVELS[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 type-ui-13 font-medium", level.tone)}>
      <span aria-hidden className="flex h-3 w-3 items-end gap-px">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn("w-[3px] rounded-[1px]", n <= level.bars ? level.fill : "bg-grey-200")}
            style={{ height: 1 + n * 3 }}
          />
        ))}
      </span>
      {level.label}
    </span>
  );
}
