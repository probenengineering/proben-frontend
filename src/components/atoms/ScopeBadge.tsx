import { cn } from "@/lib/utils";

import { Icon } from "./Icon";

// Role scope pill (Figma "Access" in role cards 103:18144): 999px, 8px left / 10px right / 3px
// padding, 6px gap; 14px shield icon and Inter Medium 12/17. slate-100 fill, white on the selected
// card, greyed (grey-400 text and icon) when the role is locked.
export interface ScopeBadgeProps {
  children: string;
  tone?: "default" | "selected" | "muted";
}

export function ScopeBadge({ children, tone = "default" }: ScopeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full py-[3px] pr-2.5 pl-2 type-ui-12-17 font-medium whitespace-nowrap",
        tone === "selected" ? "bg-white" : "bg-slate-100",
        tone === "muted" ? "text-grey-400" : "text-grey-700",
      )}
    >
      <Icon name={tone === "muted" ? "scope-muted-14" : "scope-14"} size={14} />
      {children}
    </span>
  );
}
