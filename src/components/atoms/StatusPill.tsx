import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Small status pill (24px radius). Green: "Clock in", "Clock out". Leaf: "Clocked in".
// Orange: "Not clocked in", "3 available", "Pending". Teal: "In progress".
// Amber: "On break", "Break ended". Black: "Take break", "Resume work". Mint: "Completed".
// Outline: "Pending" in the task table.
// Figma uses "Inter Display" Medium at −2%; built with Inter Medium (agreed).
// Sizes: "xs" = 10px text (no Figma text token at 10px/1.45), "sm" = 12px.
// Pass `onClick` to render it as a button (the clock action inside the "My time" ring).
const tones = {
  green: "bg-green-100 text-green-800",
  leaf: "bg-green-100 text-green-700",
  orange: "bg-pending-50 text-pending",
  teal: "bg-progress-50 text-unread",
  amber: "bg-warning-50 text-warning",
  black: "bg-black text-white",
  /** Task "Completed": green-100 with Figma's schemes/tertiary text. */
  mint: "bg-green-100 text-unread",
  /** Task "Pending" (list view): white with a grey-300 border. */
  outline: "border border-grey-300 bg-white text-black",
  /** Task "Over due". Figma #FFDAD6 / #BA1A1A aren't tokens; nearest: error-50 / error-700. */
  danger: "bg-error-50 text-error-700",
};

export interface StatusPillProps {
  children: ReactNode;
  tone?: keyof typeof tones;
  size?: "xs" | "sm";
  /** Small 8px dot before the text, in the text colour. */
  dot?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatusPill({
  children,
  tone = "green",
  size = "xs",
  dot,
  onClick,
  className,
}: StatusPillProps) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      {...(onClick && { type: "button" as const, onClick })}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-[24px] px-2 py-1 type-paragraph-xs font-inter! font-medium tracking-[-0.02em] whitespace-nowrap",
        size === "xs" && "text-[10px]",
        onClick &&
          "cursor-pointer transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-2 shrink-0 rounded-[12px] bg-current" />}
      {children}
    </Tag>
  );
}
