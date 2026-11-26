import type { ComponentProps } from "react";

import { Checkbox as BaseCheckbox } from "@/components/ui";
import { cn } from "@/lib/utils";

// Figma checkbox: 16px, black-20 border, 4px radius. Ticked = green-500 fill with a white tick.
// (Figma's ticked icon is 19px; we keep 16px so labels don't shift, as agreed.)
// size "sm" = 14px (dashboard "Needs Attention"), "lg" = 24px (task list rows), "form" = 18px with
// a 5px radius (task form confirm, Figma 60:11936).
export interface CheckboxProps extends ComponentProps<typeof BaseCheckbox> {
  size?: "sm" | "md" | "lg" | "form";
}

export function Checkbox({ className, size = "md", ...props }: CheckboxProps) {
  return (
    <BaseCheckbox
      className={cn(
        size === "sm" && "size-3.5 [&_svg]:size-3!",
        size === "lg" && "size-6 [&_svg]:size-4!",
        size === "form" && "size-4.5 rounded-[5px] border-grey-300 [&_svg]:size-3.5!",
        "border-black-20 bg-white focus-visible:border-green-500 focus-visible:ring-green-500/30 data-checked:border-green-500 data-checked:bg-green-500 data-checked:text-white",
        className,
      )}
      {...props}
    />
  );
}
