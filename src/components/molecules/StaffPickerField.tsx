"use client";

import { type ReactNode, useState } from "react";

import { Icon } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

import { fieldBox, FormFieldShell } from "./FormFieldShell";

// "Assign to" on Assign task (Figma "Field" 103:20440): the Select field's 44px box and chevron
// (FormSelectField), showing "Daniel Mensah  ·  Caregiver". The list has no Figma frame: the
// Select field's menu (14px radius, slate-200 border, menu shadow, 36px rows, green tick) with a
// search box on top, because the people come from the staff API (name, email or staff ID).
export interface StaffPickerOption {
  id: string;
  label: string;
}

export interface StaffPickerFieldProps {
  label: string;
  placeholder: string;
  options: StaffPickerOption[];
  value: StaffPickerOption | null;
  onChange: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searching?: boolean;
  required?: boolean;
  error?: ReactNode;
}

export function StaffPickerField({
  label,
  placeholder,
  options,
  value,
  onChange,
  query,
  onQueryChange,
  searching,
  required,
  error,
}: StaffPickerFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <FormFieldShell label={label} required={required} error={error}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label={label}
          aria-invalid={!!error || undefined}
          className={cn(fieldBox({ error: !!error }), "text-left")}
        >
          <span
            className={cn("min-w-0 flex-1 truncate", value ? "text-slate-900" : "text-grey-400")}
          >
            {value?.label ?? placeholder}
          </span>
          <Icon name="select-chevron-16" size={16} />
          {error && <Icon name="info-red-16" size={16} />}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex w-(--anchor-width) flex-col gap-0.5 rounded-[14px] border border-slate-200 bg-white p-2 shadow-menu ring-0"
        >
          <label className="mb-1 flex h-9 items-center gap-2 rounded-[8px] border border-slate-200 px-2.5">
            <Icon name="search" size={16} />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by name, staff ID, or email"
              aria-label="Search staff"
              className="min-w-0 flex-1 bg-transparent type-ui-14 text-slate-900 outline-none placeholder:text-grey-400"
            />
          </label>
          <div role="listbox" aria-busy={searching || undefined} className="contents">
            {options.map((option) => {
              const selected = option.id === value?.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-9 w-full shrink-0 items-center gap-2.5 rounded-[8px] px-2.5 text-left type-ui-14 text-slate-900",
                    selected ? "bg-green-tint font-semibold" : "font-medium hover:bg-slate-100",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {selected && <Icon name="check-green-16" size={16} />}
                </button>
              );
            })}
            {options.length === 0 && (
              <p className="px-2.5 py-2 type-ui-13 text-slate-500">
                {searching ? "Searching…" : "No staff members found."}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </FormFieldShell>
  );
}
