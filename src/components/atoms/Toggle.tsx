"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

// Figma "Toggle" (Add staff 103:18711): 36 × 20 green-500 pill, 16px white knob 2px from the edge
// with a soft shadow (0 1px 2px slate-900/10). Off (grey-300, knob on the left) isn't in Figma.
// The existing Switch atom is a different, smaller Figma toggle (20 × 16).
export interface ToggleProps extends SwitchPrimitive.Root.Props {
  className?: string;
}

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-grey-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 data-checked:bg-green-500",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-toggle-knob transition-transform data-checked:translate-x-4.5" />
    </SwitchPrimitive.Root>
  );
}
