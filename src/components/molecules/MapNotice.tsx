import { Icon } from "@/components/atoms";

// Homes the map can't show (Figma "Location unavailable notice" 60:13439): white, 12px radius,
// 12 × 10 padding, 10px gaps, map-overlay shadow. 18px no-location icon, "Location unavailable
// for 1 home" (Semi Bold 13/18 caution-700) over "Lakeview Residence has no coordinates yet."
// (12/18 slate-500), then "View in list →" (Semi Bold 13/18 green-ink).
export interface MapNoticeProps {
  names: string[];
  onViewList: () => void;
}

export function MapNotice({ names, onViewList }: MapNoticeProps) {
  const n = names.length;
  return (
    <div className="flex items-center gap-2.5 rounded-[12px] bg-white py-2.5 pr-3.5 pl-3 shadow-map-overlay">
      <Icon name="no-location-18" size={18} />
      <div className="flex min-w-0 flex-col md:whitespace-nowrap">
        <p className="type-ui-13 font-semibold text-caution-700">
          Location unavailable for {n} {n === 1 ? "home" : "homes"}
        </p>
        <p className="type-ui-12 text-slate-500">
          {n === 1 ? `${names[0]} has` : `${n} homes have`} no coordinates yet.
        </p>
      </div>
      <button
        type="button"
        onClick={onViewList}
        className="flex shrink-0 items-center gap-1 pl-2 type-ui-13 font-semibold text-green-ink hover:underline"
      >
        View in list
        <Icon name="arrow-right-green-14" size={14} />
      </button>
    </div>
  );
}
