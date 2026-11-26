import Link from "next/link";

import { Icon } from "@/components/atoms";
import type { AssignedHome } from "@/types/home";

import { MiniMap } from "./MiniMap";

// Location card on the home detail page (Figma "Location" 60:13897): white, slate-200 border,
// 14px radius. A 150px map with the selected pin, then the street (Inter Medium 14/20
// slate-900), the city line (13/18 slate-500) and "View on map →" (Semi Bold 13/18 green-ink),
// 16 × 12 padding.
export interface MiniMapCardProps {
  home: AssignedHome;
}

export function MiniMapCard({ home }: MiniMapCardProps) {
  return (
    <section className="flex flex-col overflow-clip rounded-[14px] border border-slate-200 bg-white">
      <div className="flex h-37.5 items-center justify-center bg-map-land">
        {home.onMap && home.coordinates ? (
          <MiniMap
            lat={home.coordinates.lat}
            lng={home.coordinates.lng}
            label={home.name.split(" ")[0]}
          />
        ) : (
          <span className="type-ui-13 text-slate-500">Location not on map yet</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-4 py-3">
        <p className="type-ui-14 font-medium text-slate-900">{home.street ?? home.address}</p>
        {home.cityLine && <p className="type-ui-13 text-slate-500">{home.cityLine}</p>}
        {home.onMap && (
          <Link
            href={`/homes?view=map&home=${encodeURIComponent(home.id)}`}
            className="flex items-center gap-1 pt-1 type-ui-13 font-semibold text-green-ink hover:underline"
          >
            View on map
            <Icon name="arrow-right-green-14" size={14} />
          </Link>
        )}
      </div>
    </section>
  );
}
