import type { ComponentProps } from "react";

import { Icon, Input } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Header search box: search icon, "Search" placeholder, ⌘K shortcut hint.
// Pass value/onChange (or any input prop) to use it; the inbox wires it to chat search.
export interface SearchFieldProps extends Omit<
  ComponentProps<typeof Input>,
  "iconLeft" | "iconRight" | "frameClassName"
> {
  className?: string;
}

export function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <Input
      aria-label="Search"
      placeholder="Search"
      iconLeft={<Icon name="search" size={16} />}
      iconRight={
        <span className="flex items-center gap-0.5">
          <Icon name="kbd-cmd" />
          <Icon name="kbd-k" />
        </span>
      }
      // Figma: 241px wide, 12px radius, white-400 border, Inter Tight text in black.
      frameClassName={cn(
        "h-auto w-60.25 gap-2.5 rounded-[12px] border-white-400 py-3 pr-3 pl-4 type-title-sm",
        className,
      )}
      className="placeholder:text-black"
      {...props}
    />
  );
}
