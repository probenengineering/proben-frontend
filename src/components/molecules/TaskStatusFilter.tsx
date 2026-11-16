"use client";

import { Chip } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import type { TaskFilter } from "@/lib/tasks";
import { TASK_FILTERS } from "@/lib/tasks";

import { FilterOption } from "./FilterOption";

// "Due soon ⌄" chip that opens the task status checklist (Figma 51:11193): white panel,
// white-400 border, 16px radius, 4px + 8px padding, 36px rows, right-aligned 4px under the chip.
export interface TaskStatusFilterProps {
  label?: string;
  selected: TaskFilter[];
  onChange: (selected: TaskFilter[]) => void;
}

export function TaskStatusFilter({
  label = "Due soon",
  selected,
  onChange,
}: TaskStatusFilterProps) {
  const toggle = (id: TaskFilter, on: boolean) =>
    onChange(on ? [...selected, id] : selected.filter((value) => value !== id));

  return (
    <Popover>
      <PopoverTrigger render={<Chip trailingIcon="chevron-down-18" />}>{label}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={4}
        className="w-45.5 gap-0 rounded-[16px] border border-white-400 bg-white p-1 shadow-none ring-0"
      >
        <div className="flex flex-col px-2">
          {TASK_FILTERS.map((filter) => (
            <FilterOption
              key={filter.id}
              label={filter.label}
              medium
              checked={selected.includes(filter.id)}
              onCheckedChange={(on) => toggle(filter.id, on)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
