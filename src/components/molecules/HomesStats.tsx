import { Icon, type IconName } from "@/components/atoms";

// My homes summary line (Figma "Assigned homes summary" 60:12853): 16px green icons, the number
// in Inter Semi Bold 14/20 slate-900 and the label in 14/20 slate-500 (6px gaps, 20px between
// stats), then "Updated 2 min ago" (12/18 grey-400) on the right.
export interface HomesStatsProps {
  /** Undefined while loading (Figma 60:13068): shows "—". */
  homes?: number;
  active?: number;
  locations?: number;
  /** "Updated 2 min ago". */
  updated?: string;
}

function Stat({ icon, value, label }: { icon: IconName; value?: number; label: string }) {
  return (
    <span className="flex items-center gap-1.5 type-ui-14">
      <Icon name={icon} size={16} />
      <span className="font-semibold text-slate-900">{value ?? "—"}</span>
      <span className="text-slate-500">{label}</span>
    </span>
  );
}

export function HomesStats({ homes, active, locations, updated }: HomesStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <Stat
        icon="stat-homes-16"
        value={homes}
        label={homes === 1 ? "assigned home" : "assigned homes"}
      />
      <Stat
        icon="stat-active-16"
        value={active}
        label={active === 1 ? "active assignment" : "active assignments"}
      />
      <Stat
        icon="stat-location-16"
        value={locations}
        label={locations === 1 ? "location" : "locations"}
      />
      {updated && <span className="ml-auto type-ui-12 text-grey-400">{updated}</span>}
    </div>
  );
}
