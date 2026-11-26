import Link from "next/link";

import { Button, Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Empty schedule message: green-tinted circle with a calendar, title, grey line, two pill buttons.
// "compact" = Home schedule card (Figma 60:10643): 48px circle / 24px icon, Inter Semi Bold 16/24,
//   10px gaps, 16 × 8 buttons. Defaults to "You're not scheduled today".
// "large" = Schedule list (Figma 60:7019): 72px circle / 32px icon, Inter Semi Bold 18/28, 16px gaps
//   (6px between title and text), 96px top / 120px bottom, 16 × 10 buttons.
export interface ScheduleEmptyAction {
  label: string;
  variant: "outline" | "green";
  /** Omit for a button with no action yet. */
  href?: string;
}

export interface ScheduleEmptyProps {
  size?: "compact" | "large";
  icon?: IconName;
  title?: string;
  text?: string;
  actions?: ScheduleEmptyAction[];
}

export function ScheduleEmpty({
  size = "compact",
  icon = "calendar-green",
  title = "You’re not scheduled today",
  text = "Pick up an open shift below or check your upcoming week.",
  actions = [
    { label: "View my week", variant: "outline", href: "/tasks" },
    { label: "Browse open shifts", variant: "green", href: "#open-shifts" },
  ],
}: ScheduleEmptyProps) {
  const large = size === "large";
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center px-4 text-center",
        large ? "gap-4 pt-24 pb-30" : "gap-2.5 py-7",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-green-500/12",
          large ? "size-18" : "size-12",
        )}
      >
        <Icon name={icon} size={large ? 32 : 24} />
      </span>
      <div className={cn("flex flex-col items-center", large ? "gap-1.5" : "gap-2.5")}>
        <p className={cn("font-semibold text-slate-900", large ? "type-ui-18-28" : "type-ui-16")}>
          {title}
        </p>
        <p className="type-ui-14 text-slate-500">{text}</p>
      </div>
      <div className={cn("flex flex-wrap justify-center", large ? "gap-3" : "gap-2.5")}>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            size={large ? "pill" : "pill-md"}
            className={large ? "px-4" : undefined}
            {...(action.href && { render: <Link href={action.href} />, nativeButton: false })}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
