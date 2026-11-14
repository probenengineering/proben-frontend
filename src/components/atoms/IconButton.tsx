import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./Icon";

// Figma "Icon Button": 24px white square, black-20 border, 4px radius, 20px icon inside.
export interface IconButtonProps extends Omit<ComponentProps<"button">, "children"> {
  icon: IconName;
  /** Accessible name, e.g. "Previous month". */
  label: string;
}

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-[4px] border border-black-20 bg-white",
        className,
      )}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}
