import Link from "next/link";

import { StatePill, type StatePillTone } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma "Agenda Item" (60:5324): 10px-radius card with a 3px coloured category bar, time, title
// and a status pill. States: Default, Hover (slate-50 fill, grey-300 border), In progress
// (info-200 border), Completed (bar at 40%, struck-through grey title), Overdue (red time).
export type AgendaStatus = "upcoming" | "in_progress" | "completed" | "overdue";
export type AgendaColor = "green" | "blue" | "purple" | "emerald" | "amber";

const bars: Record<AgendaColor, string> = {
  green: "bg-green-500",
  blue: "bg-event-blue",
  purple: "bg-event-purple",
  emerald: "bg-event-green",
  amber: "bg-caution-500",
};

const pills: Record<AgendaStatus, { label: string; tone: StatePillTone }> = {
  upcoming: { label: "Upcoming", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
};

export interface AgendaItemProps {
  /** "9:00 – 10:00 AM". */
  time: string;
  title: string;
  color: AgendaColor;
  status: AgendaStatus;
  href?: string;
}

export function AgendaItem({ time, title, color, status, href = "/tasks" }: AgendaItemProps) {
  const done = status === "completed";
  return (
    <li className="w-full">
      <Link
        href={href}
        className={cn(
          "flex w-full items-center gap-3 rounded-[10px] border bg-white px-3 py-2.5 transition-colors hover:border-grey-300 hover:bg-slate-50",
          status === "in_progress" ? "border-info-200" : "border-slate-200",
        )}
      >
        <span
          aria-hidden
          className={cn("h-9 w-[3px] shrink-0 rounded-[2px]", bars[color], done && "opacity-40")}
        />
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 font-medium">
          <span
            className={cn(
              "type-ui-12 whitespace-nowrap",
              status === "overdue" ? "text-danger-700" : "text-slate-500",
            )}
          >
            {time}
          </span>
          <span
            className={cn(
              "w-full truncate type-ui-14",
              done ? "text-grey-400 line-through" : "text-slate-900",
            )}
          >
            {title}
          </span>
        </span>
        <StatePill tone={pills[status].tone}>{pills[status].label}</StatePill>
      </Link>
    </li>
  );
}
