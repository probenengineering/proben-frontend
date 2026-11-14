import { cn } from "@/lib/utils";

// Week calendar column header: "SUN" (Inter Bold 10px) over the date (Inter Medium 22/32).
// Background follows the column: white-50 on weekends, calendar-today for today, else white.
// Figma's calendar uses Inter at sizes with no text token (10/12 bold, 22/32 medium).
export type CalendarDayTone = "weekday" | "weekend" | "today";

export const dayToneClass: Record<CalendarDayTone, string> = {
  weekday: "bg-white",
  weekend: "bg-white-50",
  today: "bg-calendar-today",
};

export interface CalendarDayHeaderProps {
  weekday: string;
  date: number;
  tone?: CalendarDayTone;
  last?: boolean;
}

export function CalendarDayHeader({
  weekday,
  date,
  tone = "weekday",
  last,
}: CalendarDayHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col px-2 pt-1 pb-4 font-inter",
        "border-b border-calendar-line",
        !last && "border-r",
        dayToneClass[tone],
      )}
    >
      <span className="text-[10px] leading-3 font-bold text-calendar-label">{weekday}</span>
      <span className="text-[22px] leading-8 font-medium text-black">{date}</span>
    </div>
  );
}
