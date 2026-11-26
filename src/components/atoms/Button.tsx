import type { ComponentProps, ReactNode } from "react";

import { Button as BaseButton } from "@/components/ui";
import { cn } from "@/lib/utils";

// Figma components "Button / primary", "Button / greys" (outline and plain), "Button / destructive".
// Hover and press states are not in Figma yet, so shadcn's defaults are kept.
// Home dashboard v2 (Figma 60:9785…) adds the 999px "pill" sizes and the dark / muted fills.
const variants = {
  // Figma has no border here. Disabled = Figma's grey "Button / primary" (#D0D5DD), full opacity.
  primary: {
    base: "default",
    className: "border-0 text-white disabled:bg-grey-300 disabled:opacity-100",
  },
  outline: { base: "outline", className: "border-grey-300 bg-white text-grey-700" },
  ghost: { base: "ghost", className: "bg-white text-grey-700" }, // "greys" with no border (Cancel)
  destructive: {
    base: "default",
    className: "border-0 bg-error-500 text-white hover:bg-error-500/90",
  },
  /** v2 green pill: "Clock in", "End break", "Try again". */
  green: { base: "default", className: "border-0 bg-green-500 text-white hover:bg-green-500/90" },
  /** "Clock out". */
  dark: { base: "default", className: "border-0 bg-slate-900 text-white hover:bg-slate-900/90" },
  /** "Break used": greyed and not clickable. */
  muted: {
    base: "default",
    className: "border-0 bg-slate-100 text-grey-400 hover:bg-slate-100 disabled:opacity-100",
  },
} as const;

const sizes = {
  md: "h-9 rounded-md py-2 type-paragraph-sm font-semibold",
  /** 999px pill, Inter Semi Bold 14/20, 18px × 10px padding ("Clock in", "Take break"). */
  pill: "h-auto rounded-full px-4.5 py-2.5 type-ui-14 font-semibold",
  /** Empty schedule actions: 16px × 8px padding ("View my week"). */
  "pill-md": "h-auto rounded-full px-4 py-2 type-ui-14 font-semibold",
  /** Modal actions: as "pill" with 11px vertical padding. */
  "pill-lg": "h-auto rounded-full px-4.5 py-[11px] type-ui-14 font-semibold",
  /** Event popover actions: Inter Semi Bold 13/20, 12px × 8px padding ("Mark complete"). */
  "pill-compact": "h-auto rounded-full px-3 py-2 type-ui-13-20 font-semibold",
  /** "Pick up": Inter Semi Bold 13/18, 12px × 6px padding. */
  "pill-sm": "h-auto rounded-full px-3 py-1.5 type-ui-13 font-semibold",
};

export interface ButtonProps extends Omit<ComponentProps<typeof BaseButton>, "variant" | "size"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Icon shown before the label, e.g. <Icon name="google" /> */
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      variant={variants[variant].base}
      className={cn(
        "gap-2",
        sizes[size],
        size === "md" && (variant === "outline" ? "px-3" : "px-4"),
        variants[variant].className,
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </BaseButton>
  );
}
