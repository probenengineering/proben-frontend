"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

// The ⋯ on a table row and its menu (Figma "Row actions menu" 103:18467). Trigger: 8px padding,
// 999px; open (103:18456): white with a grey-300 border. Menu: white, slate-200 border, 12px
// radius, 6px padding, 2px gaps, row-menu shadow. Items 216px, 12 × 9 padding, 10px gaps, 8px
// radius, 18px icon, Inter Medium 14/20 grey-700; hover slate-50. Danger items come after a
// slate-200 line, in danger-600.
export interface RowAction<T extends string> {
  action: T;
  icon: IconName;
  label: string;
  danger?: boolean;
}

export interface RowActionMenuProps<T extends string> {
  label: string;
  items: RowAction<T>[];
  onAction: (action: T) => void;
  onOpenChange?: (open: boolean) => void;
}

export function RowActionMenu<T extends string>({
  label,
  items,
  onAction,
  onOpenChange,
}: RowActionMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  const regular = items.filter((i) => !i.danger);
  const danger = items.filter((i) => i.danger);
  const item = (i: RowAction<T>) => (
    <button
      key={i.action}
      type="button"
      role="menuitem"
      onClick={() => {
        change(false);
        onAction(i.action);
      }}
      className={cn(
        "flex w-54 items-center gap-2.5 rounded-[8px] px-3 py-[9px] text-left type-ui-14 font-medium outline-none hover:bg-slate-50 focus-visible:bg-slate-50",
        i.danger ? "text-danger-600" : "text-grey-700",
      )}
    >
      <Icon name={i.icon} size={18} />
      {i.label}
    </button>
  );

  return (
    <Popover open={open} onOpenChange={change}>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          "flex items-center justify-center rounded-full border p-2 transition-[background-color,border-color,transform] duration-150 hover:bg-slate-100 active:scale-95 motion-reduce:active:scale-100",
          open ? "border-grey-300 bg-white" : "border-transparent",
        )}
      >
        <Icon name="more-20" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={4}
        className="flex w-auto flex-col gap-0.5 rounded-[12px] border border-slate-200 bg-white p-1.5 shadow-row-menu ring-0"
      >
        <div role="menu" aria-label={label} className="flex flex-col gap-0.5">
          {regular.map(item)}
          {danger.length > 0 && <span className="h-px w-54 bg-slate-200" />}
          {danger.map(item)}
        </div>
      </PopoverContent>
    </Popover>
  );
}
