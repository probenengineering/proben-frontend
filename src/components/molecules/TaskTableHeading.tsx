"use client";

import { Icon } from "@/components/atoms";

import { PageHeading } from "./PageHeading";

// My tasks heading row (Figma 60:11043): "My tasks" + description on the left, a 280px search
// pill (40px, grey-300 border, 16px icon, Inter 14/20) on the right; wraps on small screens.
export interface TaskTableHeadingProps {
  query?: string;
  onQueryChange?: (query: string) => void;
}

export function TaskTableHeading({ query = "", onQueryChange }: TaskTableHeadingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5">
      <PageHeading
        title="My tasks"
        description="Everything assigned to you across Proben, in one place"
      />
      <label className="flex h-10 w-full items-center gap-2 rounded-full border border-grey-300 bg-white px-3.5 sm:w-70">
        <Icon name="search" size={16} />
        <input
          type="search"
          value={query}
          disabled={!onQueryChange}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
          className="min-w-0 flex-1 bg-transparent type-ui-14 text-slate-900 outline-none placeholder:text-grey-400"
        />
      </label>
    </div>
  );
}
