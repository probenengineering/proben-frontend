import Link from "next/link";

import { Button, Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Empty My tasks table (Figma "Empty state": no tasks 60:11419, caught up 60:11487): centred,
// 64px top / 72px bottom padding, 12px gaps. 56px verified-500/12 tile (16.8px radius) with a
// 28px check, title Inter Semi Bold 18/28 slate-900, a line of Inter 14/20 slate-500, then one
// pill: outline "Back to overview" (40px) or green "View coming up" (38px).
export interface TaskTableEmptyProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  /** Link target; ignored when onAction is set. */
  href?: string;
  onAction?: () => void;
  tone?: "outline" | "green";
  /** 28px glyph and its 56px tile (My homes "No homes found", 60:13058: search on a round green-tint). */
  icon?: IconName;
  iconClassName?: string;
  className?: string;
}

export function TaskTableEmpty({
  title = "No tasks assigned yet",
  message = "When your organization assigns training, documents or acknowledgements, they’ll appear here.",
  actionLabel = "Back to overview",
  href = "/",
  onAction,
  tone = "outline",
  icon = "tasks-empty",
  iconClassName = "rounded-[16.8px] bg-verified-500/12",
  className,
}: TaskTableEmptyProps) {
  const green = tone === "green";
  const buttonClass = green ? "px-4 py-[9px] h-9.5" : "px-4 py-[9px]";
  return (
    <div className={cn("flex flex-col items-center gap-3 px-4 pt-16 pb-18 text-center", className)}>
      <span className={cn("flex size-14 items-center justify-center", iconClassName)}>
        <Icon name={icon} size={28} />
      </span>
      <p className="type-ui-18-28 font-semibold text-slate-900">{title}</p>
      <p className="max-w-100 type-ui-14 text-slate-500">{message}</p>
      {onAction ? (
        <Button
          variant={green ? "green" : "outline"}
          size="pill-md"
          className={buttonClass}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : (
        <Button
          variant={green ? "green" : "outline"}
          size="pill-md"
          className={buttonClass}
          render={<Link href={href} />}
          nativeButton={false}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
