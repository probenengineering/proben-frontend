import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

// "All teams / All homes / All roles" button in the filter menu; opens its own list below it.
export interface FilterDropdownProps {
  icon: IconName;
  label: string;
  children: ReactNode;
  /** Panel width and horizontal offset from the button, as in Figma. */
  panelClassName?: string;
  alignOffset?: number;
}

export function FilterDropdown({
  icon,
  label,
  children,
  panelClassName,
  alignOffset = 0,
}: FilterDropdownProps) {
  return (
    <Popover>
      {/* Figma's 44px height includes the border, so the padding is 11px rather than 12px. */}
      <PopoverTrigger className="flex w-full items-center gap-1 overflow-clip rounded-[12px] border border-white-400 px-2 py-2.75">
        <span className="flex min-w-0 flex-1 items-center gap-3 type-paragraph-sm text-grey-700">
          <Icon name={icon} />
          {label}
        </span>
        <Icon name="chevron-down" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        alignOffset={alignOffset}
        sideOffset={2}
        // Figma: white, white-400 border, 16px radius, 4px padding, soft drop shadow (one-off).
        className={cn(
          "gap-2.5 rounded-[16px] border border-white-400 bg-white p-1 shadow-none ring-0 drop-shadow-[0_4px_2px_rgba(230,230,230,0.25)]",
          panelClassName,
        )}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
