import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// List / Map segmented switch (Figma "View switcher" 60:12851): slate-100 track, 3px padding,
// 2px gap. Segments 30px, 14 × 6 padding, 6px gap, 16px icon, Inter 13/18. Selected: white,
// Semi Bold slate-900 with the green icon; other: Medium slate-500 with a grey icon.
export type HomesView = "list" | "map";

export interface ViewSwitchProps {
  value: HomesView;
  onChange: (view: HomesView) => void;
}

const VIEWS = [
  { id: "list", label: "List", on: "view-list-active-16", off: "view-list-16" },
  { id: "map", label: "Map", on: "view-map-active-16", off: "view-map-16" },
] as const;

export function ViewSwitch({ value, onChange }: ViewSwitchProps) {
  return (
    <div role="tablist" aria-label="View" className="flex gap-0.5 rounded-full bg-slate-100 p-0.75">
      {VIEWS.map((v) => {
        const selected = v.id === value;
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(v.id)}
            className={cn(
              "flex h-7.5 items-center gap-1.5 rounded-full px-3.5 type-ui-13",
              selected ? "bg-white font-semibold text-slate-900" : "font-medium text-slate-500",
            )}
          >
            <Icon name={selected ? v.on : v.off} size={16} />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
