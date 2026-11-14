import { Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma "Event": tinted block (colour at 10%) with a 3px colour bar, then the time (with an
// optional round video badge) and title in Inter Semi Bold 12/16. "plain" drops the tint and bar
// (Figma's Monday lunch). Text is clipped when the block is short, as in Figma.
export type CalendarEventColor = "blue" | "green" | "purple" | "amber";

const colors: Record<CalendarEventColor, { tint: string; bar: string; text: string }> = {
  blue: { tint: "bg-event-blue/10", bar: "bg-event-blue", text: "text-event-blue-text" },
  green: { tint: "bg-event-green/10", bar: "bg-event-green", text: "text-event-green-text" },
  purple: { tint: "bg-event-purple/10", bar: "bg-event-purple", text: "text-event-purple-text" },
  amber: { tint: "bg-warning/10", bar: "bg-warning", text: "text-event-amber-text" },
};

const badges: Partial<Record<CalendarEventColor, { bg: string; icon: IconName }>> = {
  blue: { bg: "bg-event-blue-text", icon: "video-badge-blue" },
  purple: { bg: "bg-event-purple-text", icon: "video-badge-purple" },
  amber: { bg: "bg-event-amber-text", icon: "video-badge-amber" },
};

export interface CalendarEventProps {
  time: string;
  title: string;
  color?: CalendarEventColor;
  video?: boolean;
  plain?: boolean;
  className?: string;
}

export function CalendarEvent({
  time,
  title,
  color = "blue",
  video,
  plain,
  className,
}: CalendarEventProps) {
  const c = colors[color];
  const badge = video ? badges[color] : undefined;
  return (
    <div
      className={cn(
        "flex size-full overflow-clip rounded-[4px] font-inter text-xs leading-4 font-semibold",
        !plain && c.tint,
        c.text,
        className,
      )}
    >
      {!plain && <span className={cn("h-full w-0.75 shrink-0", c.bar)} />}
      <div className="flex min-w-0 flex-1 flex-col p-1.5">
        <span className="flex items-center gap-1 whitespace-nowrap">
          {time}
          {badge && (
            <span className={cn("flex rounded-full p-0.5", badge.bg)}>
              <Icon name={badge.icon} size={8} />
            </span>
          )}
        </span>
        <span>{title}</span>
      </div>
    </div>
  );
}
