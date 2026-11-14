import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./Icon";

// Figma component "Chip": pill-shaped filter.
// variant "filled": selected = green-500 fill (tabs). variant "outline": selected = green-50 fill
// with a green-600 border (Calender / List toggle). Unselected = white with a grey-300 border.
// Optional 18px icon before (icon) or after (trailingIcon) the label; href renders a link.
export interface ChipProps extends ComponentProps<"button"> {
  selected?: boolean;
  variant?: "filled" | "outline";
  icon?: IconName;
  trailingIcon?: IconName;
  href?: string;
}

export function Chip({
  selected,
  variant = "filled",
  icon,
  trailingIcon,
  href,
  className,
  children,
  ...props
}: ChipProps) {
  const classes = cn(
    // Figma radius 32px; no radius token yet.
    "flex items-center justify-center rounded-[32px] py-1.5 pr-2 pl-3 type-paragraph-sm font-medium whitespace-nowrap",
    (icon || trailingIcon) && "gap-2 px-3",
    selected && variant === "filled" && "bg-green-500 text-black",
    selected && variant === "outline" && "border border-green-600 bg-green-50 text-grey-600",
    !selected && "border border-grey-300 bg-white text-grey-500",
    className,
  );
  const content = (
    <>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={18} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-current={selected ? "page" : undefined} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" aria-pressed={selected} className={classes} {...props}>
      {content}
    </button>
  );
}
