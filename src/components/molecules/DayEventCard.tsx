import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { CalendarEventColor } from "./CalendarEvent";

// Day view event (Figma "Event / …" 60:8618, 60:8636): 6px radius, 10% tint, 3px bar, text in the
// event's dark colour. Short (< 45 min): one line, "9:00 AM – 9:30 AM" (Semi Bold 12/18) + title
// (Semi Bold 13/20). Longer: time, title, then the subtitle (Regular 12/18). Done: 80% opacity,
// struck-through title, 18px green check circle on the right. Selected (quick peek open) adds the
// calendar's selected border + shadow.
const colors: Record<
  CalendarEventColor,
  { tint: string; bar: string; text: string; border: string }
> = {
  blue: {
    tint: "bg-event-blue/10",
    bar: "bg-event-blue",
    text: "text-event-blue-text",
    border: "border-event-blue",
  },
  green: {
    tint: "bg-event-green/10",
    bar: "bg-event-green",
    text: "text-event-green-text",
    border: "border-event-green",
  },
  purple: {
    tint: "bg-event-purple/10",
    bar: "bg-event-purple",
    text: "text-event-purple-text",
    border: "border-event-purple",
  },
  amber: {
    tint: "bg-warning/10",
    bar: "bg-warning",
    text: "text-event-amber-text",
    border: "border-warning",
  },
};

export interface DayEventCardProps {
  time: string;
  title: string;
  subtitle?: string;
  color: CalendarEventColor;
  /** Hours; under 0.75 renders the one-line layout. */
  duration: number;
  done?: boolean;
  selected?: boolean;
}

export function DayEventCard({
  time,
  title,
  subtitle,
  color,
  duration,
  done,
  selected,
}: DayEventCardProps) {
  const c = colors[color];
  const short = duration < 0.75;
  return (
    <div
      className={cn(
        "relative flex size-full overflow-clip rounded-[6px] bg-white text-left",
        done && "opacity-80",
        selected && cn("border-[1.5px] shadow-event-selected", c.border),
      )}
    >
      <span aria-hidden className={cn("absolute inset-0", c.tint)} />
      <span aria-hidden className={cn("relative h-full w-[3px] shrink-0", c.bar)} />
      <span
        className={cn(
          "relative flex min-w-0 flex-1 pl-2.25 font-semibold whitespace-nowrap",
          c.text,
          short ? "items-center gap-2.5 pr-8" : "flex-col gap-0.5 pt-2 pr-3",
        )}
      >
        <span className="type-ui-12">{time}</span>
        <span className={cn("truncate type-ui-13-20", done && "line-through")}>{title}</span>
        {!short && subtitle && <span className="truncate type-ui-12 font-normal">{subtitle}</span>}
      </span>
      {done && (
        <span className="absolute top-[7px] right-2.5 flex size-4.5 items-center justify-center rounded-full bg-green-500">
          <Icon name="check-white-16" size={14} />
        </span>
      )}
    </div>
  );
}
