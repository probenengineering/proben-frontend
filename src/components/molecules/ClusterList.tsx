import { Icon } from "@/components/atoms";
import type { AssignedHome } from "@/types/home";

// Homes behind a map cluster (Figma "Grouped homes popover" 60:13575): 300px, white, 14px radius,
// 8px padding, 4px gaps, map-overlay shadow. "2 homes at this location" (Medium 12/18 slate-500),
// then a row per home (10px radius, hover slate-100): 32px green tile, name (Semi Bold 14/20) over
// "street, city" (12/18 slate-500), and a green arrow.
export interface ClusterListProps {
  homes: AssignedHome[];
  onSelect: (home: AssignedHome) => void;
}

export function ClusterList({ homes, onSelect }: ClusterListProps) {
  return (
    <div className="flex w-75 flex-col gap-1 rounded-[14px] bg-white p-2 shadow-map-overlay">
      <p className="py-1.5 pl-2.5 type-ui-12 font-medium text-slate-500">
        {homes.length} homes at this location
      </p>
      {homes.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => onSelect(h)}
          className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left hover:bg-slate-100"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-green-500/12">
            <Icon name="stat-homes-16" size={16} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate type-ui-14 font-semibold text-slate-900">{h.name}</span>
            <span className="truncate type-ui-12 text-slate-500">
              {[h.street, h.city].filter(Boolean).join(", ")}
            </span>
          </span>
          <Icon name="arrow-right-green-16" size={16} />
        </button>
      ))}
    </div>
  );
}
