import { cn } from "@/lib/utils";
import type { SearchScope } from "@/types/search";

// Scope pills in the search panel (Figma "Scopes" 60:15109): 6px gaps. Selected: slate-900 fill,
// white label (Inter Medium 13/18) and grey-300 count; others: white, grey-300 border, grey-700
// label, grey-400 count (Medium 12/16). Scopes with no results (while searching) fade to 50%.
export const SEARCH_SCOPES: { id: SearchScope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "people", label: "People" },
  { id: "messages", label: "Messages" },
  { id: "homes", label: "Homes" },
  { id: "tasks", label: "Tasks" },
  { id: "schedule", label: "Schedule" },
  { id: "files", label: "Files" },
];

export interface SearchScopeTabsProps {
  value: SearchScope;
  onChange: (scope: SearchScope) => void;
  /** Per-scope result counts once a search has run. */
  counts?: Partial<Record<SearchScope, number>>;
}

export function SearchScopeTabs({ value, onChange, counts }: SearchScopeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Search scope"
      className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto pb-2 pl-1.5"
    >
      {SEARCH_SCOPES.map((s) => {
        const on = s.id === value;
        const count = counts?.[s.id];
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(s.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 type-ui-13 font-medium",
              on ? "bg-slate-900 text-white" : "border border-grey-300 bg-white text-grey-700",
              !on && count === 0 && "opacity-50",
            )}
          >
            {s.label}
            {count !== undefined && (
              <span className={cn("type-ui-12-16", on ? "text-grey-300" : "text-grey-400")}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
