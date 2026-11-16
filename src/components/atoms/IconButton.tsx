import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./Icon";

// Figma "Icon Button": 24px white square, black-20 border, 4px radius, 20px icon inside.
// size "lg" = 40px, divider border, 12px radius (notification actions, Figma 51:11625).
export interface IconButtonProps extends Omit<ComponentProps<"button">, "children"> {
  icon: IconName;
  /** Accessible name, e.g. "Previous month". */
  label: string;
  size?: "sm" | "lg";
}

export function IconButton({ icon, label, size = "sm", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center bg-white",
        size === "lg"
          ? "size-10 rounded-[12px] border border-divider"
          : "size-6 rounded-[4px] border border-black-20",
        className,
      )}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}
