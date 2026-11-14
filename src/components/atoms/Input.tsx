import type { ComponentProps, ReactNode } from "react";

import { Input as BaseInput } from "@/components/ui";
import { cn } from "@/lib/utils";

// Figma component "Input" (size sm). States built so far: default, hover, focus/typing.
export interface InputProps extends ComponentProps<typeof BaseInput> {
  /** Icon shown at the left edge, e.g. <Icon name="search" size={16} /> */
  iconLeft?: ReactNode;
  /** Icon shown at the right edge, e.g. <Icon name="mail" /> */
  iconRight?: ReactNode;
  /** Classes for the outer frame (border box). `className` styles the text field itself. */
  frameClassName?: string;
}

export function Input({ iconLeft, iconRight, frameClassName, className, ...props }: InputProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-center gap-3 rounded-sm border border-grey-300 bg-white px-3 py-2 type-paragraph-sm transition-colors focus-within:border-green-500 hover:border-green-500",
        frameClassName,
      )}
    >
      {iconLeft}
      <BaseInput
        className={cn(
          // Reset shadcn's own box so the frame above controls the look.
          "h-auto flex-1 rounded-none border-0 bg-transparent p-0 focus-visible:ring-0",
          // Inherit the type-paragraph-sm text style from the frame.
          "text-[length:inherit] leading-[inherit] md:text-[length:inherit]",
          "text-grey-900 caret-secondary-100 placeholder:text-grey-400",
          className,
        )}
        {...props}
      />
      {iconRight}
    </div>
  );
}
