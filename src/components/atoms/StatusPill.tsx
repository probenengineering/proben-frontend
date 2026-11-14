import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Small status pill (24px radius). Green: "Clock in". Orange: "Not clocked in", "3 available",
// "Pending". Teal: "In progress".
// Figma uses "Inter Display" Medium at −2%; built with Inter Medium (agreed).
// Sizes: "xs" = 10px text (no Figma text token at 10px/1.45), "sm" = 12px.
const tones = {
  green: "bg-green-100 text-green-800",
  orange: "bg-pending-50 text-pending",
  teal: "bg-progress-50 text-unread",
};

export interface StatusPillProps {
  children: ReactNode;
  tone?: keyof typeof tones;
  size?: "xs" | "sm";
  /** Small 8px dot before the text, in the text colour. */
  dot?: boolean;
  className?: string;
}

export function StatusPill({
  children,
  tone = "green",
  size = "xs",
  dot,
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-[24px] px-2 py-1 type-paragraph-xs font-inter! font-medium tracking-[-0.02em] whitespace-nowrap",
        size === "xs" && "text-[10px]",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-2 shrink-0 rounded-[12px] bg-current" />}
      {children}
    </span>
  );
}
