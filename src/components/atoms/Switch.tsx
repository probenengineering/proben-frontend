"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

// Figma "toggle-on-circle": 20x16 pill (icon colour) with a 9px white knob, inset 3.7px.
// Built on Base UI directly (shadcn's switch fixes a 16px knob). OFF (grey-300) isn't in Figma.
export interface SwitchProps extends SwitchPrimitive.Root.Props {
  className?: string;
}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-[16.28px] w-5 shrink-0 items-center rounded-full bg-grey-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 data-checked:bg-icon",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[8.84px] translate-x-[3.72px] rounded-full bg-white transition-transform data-checked:translate-x-[7.44px]" />
    </SwitchPrimitive.Root>
  );
}
