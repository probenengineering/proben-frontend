"use client";

import { Fragment, useState } from "react";

import { Icon } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

// Pill dropdown in the My tasks toolbar (Figma "Status dropdown" 60:11055, "Dropdown / All sources"
// 60:11057). "status" = 36px, grey dot + "Status" (Inter Medium 13/18 slate-500) + value (Semi Bold
// slate-900) + count badge (slate-100, 999px) + chevron. "plain" = 32px, value only (grey-700).
// Filtered (not the default option, Figma 60:11084): green-tint fill, green-500 border, white count.
// Menu (Figma "Status Menu" 60:12809): 264px, 14px radius, slate-200 border, menu shadow, 8px
// padding, 2px gaps. Optional heading (Inter Medium 12/18 slate-500), a divider after the first
// option. Items 36px, 8px radius, 10px padding/gaps: optional 8px dot, label Inter Medium 14/20
// slate-900, count Medium 13/18 slate-500, 16px green tick. Selected: green-tint + Semi Bold +
// tick; hover slate-100.
export interface FilterSelectOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  /** Dot colour class shown in the menu, e.g. "bg-danger-500". */
  dot?: string;
}

export interface FilterSelectProps<T extends string> {
  value: T;
  options: FilterSelectOption<T>[];
  onChange: (value: T) => void;
  variant?: "status" | "plain";
  /** Text before the value, e.g. "Sort:". */
  prefix?: string;
  /** Green outline when not on the default option. */
  active?: boolean;
  /** Status dot colour class (status variant); grey-400 by default. */
  dotClass?: string;
  /** Status variant: the grey label before the value ("Status", "Assignment", "City", "Sort"). */
  fieldLabel?: string;
  /** Status variant: show the coloured dot (off for My homes filters, Figma 60:12879). */
  showDot?: boolean;
  /** Menu heading, e.g. "Filter by status". */
  heading?: string;
  /** Divider between the first option ("All …") and the rest. */
  divideFirst?: boolean;
  label: string;
}

export function FilterSelect<T extends string>({
  value,
  options,
  onChange,
  variant = "plain",
  prefix,
  active,
  dotClass = "bg-grey-400",
  heading,
  divideFirst,
  fieldLabel = "Status",
  showDot = true,
  label,
}: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value) ?? options[0];
  const status = variant === "status";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          "flex shrink-0 items-center rounded-full border type-ui-13 font-medium whitespace-nowrap",
          status
            ? cn("h-9 pr-2.5 pl-3", showDot ? "gap-2" : "gap-1.5")
            : "h-8 gap-1.5 py-1.5 pr-2.5 pl-3 text-grey-700",
          active ? "border-green-500 bg-green-tint" : "border-grey-300 bg-white",
        )}
      >
        {status && showDot && <span aria-hidden className={cn("size-2 rounded-full", dotClass)} />}
        {status && <span className="text-slate-500">{fieldLabel}</span>}
        <span className={status ? "font-semibold text-slate-900" : undefined}>
          {prefix ? `${prefix} ${current.label}` : current.label}
        </span>
        {status && current.count !== undefined && (
          <span
            className={cn(
              "rounded-full px-1.75 py-px type-ui-12 text-grey-700",
              active ? "bg-white" : "bg-slate-100",
            )}
          >
            {current.count}
          </span>
        )}
        <Icon name="chevron-down" size={status ? 16 : 14} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-66 gap-0.5 rounded-[14px] border border-slate-200 bg-white p-2 shadow-menu ring-0"
      >
        {heading && (
          <p className="py-1.5 pl-2.5 type-ui-12 font-medium text-slate-500">{heading}</p>
        )}
        {options.map((o, i) => {
          const selected = o.id === value;
          return (
            <Fragment key={o.id}>
              {divideFirst && i === 1 && (
                <span aria-hidden className="py-1">
                  <span className="block h-px bg-slate-200" />
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-left type-ui-14 text-slate-900 outline-none focus-visible:ring-0",
                  selected
                    ? "bg-green-tint font-semibold"
                    : "font-medium hover:bg-slate-100 focus-visible:bg-slate-100",
                )}
              >
                {o.dot && (
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", o.dot)} />
                )}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.count !== undefined && (
                  <span className="type-ui-13 font-medium text-slate-500">{o.count}</span>
                )}
                <span className={cn("flex size-4 shrink-0", !selected && "invisible")}>
                  <Icon name="check-green-16" size={16} />
                </span>
              </button>
            </Fragment>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
