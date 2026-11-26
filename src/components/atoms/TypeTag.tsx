import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./Icon";

// Figma "Type Tag" (60:5163): 4px radius, 10% tint of the calendar event colour, 12px video
// icon, Inter Medium 12/18 in the event's text colour. Meeting = blue, Training = purple,
// Webinar = emerald, 1:1 Session = amber. `muted` = 50% (completed rows).
const tones: Record<TypeTagTone, { box: string; icon: IconName }> = {
  blue: { box: "bg-event-blue/10 text-event-blue-text", icon: "type-meeting" },
  purple: { box: "bg-event-purple/10 text-event-purple-text", icon: "type-training" },
  emerald: { box: "bg-event-green/10 text-event-green-text", icon: "type-webinar" },
  amber: { box: "bg-warning/10 text-event-amber-text", icon: "type-session" },
};

export type TypeTagTone = "blue" | "purple" | "emerald" | "amber";

export interface TypeTagProps {
  label: string;
  tone: TypeTagTone;
  muted?: boolean;
  className?: string;
}

export function TypeTag({ label, tone, muted, className }: TypeTagProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-[4px] py-[3px] pr-2 pl-1.5 type-ui-12 font-medium whitespace-nowrap",
        tones[tone].box,
        muted && "opacity-50",
        className,
      )}
    >
      <Icon name={tones[tone].icon} size={12} />
      {label}
    </span>
  );
}
