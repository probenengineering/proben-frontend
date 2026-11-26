import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Figma "Textarea" (clock-out modal 60:11000): white, 1px grey-300 border, 12px radius,
// 14px × 12px padding (40px extra at the bottom, so 74px tall), Inter 14/20, grey-400 placeholder.
export type TextareaProps = ComponentProps<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-18.5 w-full resize-y rounded-[12px] border border-grey-300 bg-white px-3.5 pt-3 pb-2 type-ui-14 text-slate-900 outline-none placeholder:text-grey-400 focus-visible:border-green-500 focus-visible:ring-3 focus-visible:ring-green-500/30",
        className,
      )}
      {...props}
    />
  );
}
