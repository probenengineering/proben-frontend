"use client";

import { type ReactNode, useState } from "react";

import { Icon } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

import { fieldBox, FormFieldShell } from "./FormFieldShell";

// Select field on the Add staff form (Figma "Field", type Select: 103:17979 / 103:17997 /
// 103:18016 / 103:18006): the 44px box with the value (slate-900) or placeholder (grey-400) and a
// 16px chevron; a red info icon after it on error; disabled = slate-50 and not clickable.
// The option list has no Figma frame: it reuses the filter menu (14px radius, slate-200 border,
// menu shadow, 36px rows, green tick on the chosen one), as wide as the field and at most 288px
// tall (as the filter menus), scrolling past that. `multiple` lets
// several be picked (Assigned homes) and stays open while picking.
export interface FormSelectFieldProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: ReactNode;
}

function summary(value: string[], placeholder: string) {
  if (value.length === 0) return placeholder;
  return value.length === 1 ? value[0] : `${value[0]} +${value.length - 1} more`;
}

export function FormSelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  multiple,
  required,
  disabled,
  error,
}: FormSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const pick = (option: string) => {
    if (!multiple) {
      onChange([option]);
      setOpen(false);
      return;
    }
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  return (
    <FormFieldShell label={label} required={required} error={error}>
      <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <PopoverTrigger
          disabled={disabled}
          aria-label={label}
          aria-invalid={!!error || undefined}
          className={cn(fieldBox({ error: !!error, disabled }), "text-left")}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              value.length && !disabled ? "text-slate-900" : "text-grey-400",
            )}
          >
            {summary(value, placeholder)}
          </span>
          <Icon name="select-chevron-16" size={16} />
          {error && <Icon name="info-red-16" size={16} />}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex max-h-72 w-(--anchor-width) flex-col gap-0.5 overflow-y-auto rounded-[14px] border border-slate-200 bg-white p-2 shadow-menu ring-0"
        >
          <div role="listbox" aria-multiselectable={multiple || undefined} className="contents">
            {options.map((option) => {
              const selected = value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => pick(option)}
                  className={cn(
                    "flex h-9 w-full shrink-0 items-center gap-2.5 rounded-[8px] px-2.5 text-left type-ui-14 text-slate-900",
                    selected ? "bg-green-tint font-semibold" : "font-medium hover:bg-slate-100",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option}</span>
                  {selected && <Icon name="check-green-16" size={16} />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </FormFieldShell>
  );
}
