"use client";

import { useState } from "react";

import { Icon } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

import { ChoiceList } from "./ChoiceList";

// A dropdown button ("No grouping ⌄") that opens a 182px list; picking an option updates the label.
// Only the label changes for now; nothing else reacts to the choice yet.
export interface SelectDropdownProps {
  options: string[];
  defaultValue: string;
  "aria-label": string;
  /** Tighter rows (28px). */
  compact?: boolean;
  /** Show a ✓ beside the chosen option, as Figma does for Ordering. */
  showCheck?: boolean;
  className?: string;
  /** Called with the option picked. */
  onChange?: (value: string) => void;
}

export function SelectDropdown({
  options,
  defaultValue,
  compact,
  showCheck,
  className,
  onChange,
  ...props
}: SelectDropdownProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Figma's 44px height includes the border, so the padding is 11px. */}
      <PopoverTrigger
        aria-label={props["aria-label"]}
        className={cn(
          "flex items-center gap-1 overflow-clip rounded-[12px] border border-white-400 px-2 py-2.75",
          className,
        )}
      >
        <span className="min-w-0 flex-1 text-left type-paragraph-sm text-grey-700">{value}</span>
        <Icon name="chevron-down" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={0}
        className="w-45.5 gap-0 rounded-[16px] border border-white-400 bg-white p-1 shadow-none ring-0 drop-shadow-[0_4px_2px_rgba(230,230,230,0.25)]"
      >
        <ChoiceList
          options={options}
          value={value}
          compact={compact}
          showCheck={showCheck}
          onSelect={(option) => {
            setValue(option);
            setOpen(false);
            onChange?.(option);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
