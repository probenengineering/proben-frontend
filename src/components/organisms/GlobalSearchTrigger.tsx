"use client";

import { SearchField } from "@/components/molecules";
import { OPEN_SEARCH_EVENT } from "@/hooks/useGlobalSearch";

// The header's search box: looks like the search field (with its ⌘K hint) and opens the global
// search (GlobalSearch, mounted in the app shell) when clicked or focused.
export interface GlobalSearchTriggerProps {
  className?: string;
}

export function GlobalSearchTrigger({ className }: GlobalSearchTriggerProps) {
  const open = () => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
  return (
    <SearchField
      readOnly
      aria-haspopup="dialog"
      onClick={open}
      onFocus={(e) => {
        e.currentTarget.blur();
        open();
      }}
      className={className}
    />
  );
}
