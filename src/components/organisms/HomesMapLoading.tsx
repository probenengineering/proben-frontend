import { Icon } from "@/components/atoms";
import { MapLoadingCard } from "@/components/molecules";

// Homes map while it loads (Figma 60:13699): the 600px map area (map-land, slate-200 border, 16px
// radius), the "Loading homes…" chip top left, the zoom controls top right (inert), and the
// loading card in the middle. Until the map library is installed this is what the Map view shows.
const OVERLAY = "bg-white shadow-map-overlay";

export function HomesMapLoading() {
  return (
    <div className="relative flex h-150 items-center justify-center overflow-clip rounded-[16px] border border-slate-200 bg-map-land">
      <span
        className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.75 type-ui-13 font-semibold text-slate-900 ${OVERLAY}`}
      >
        <Icon name="stat-homes-16" size={16} />
        Loading homes…
      </span>
      <span
        aria-hidden
        className={`absolute top-3 right-3 flex flex-col overflow-clip rounded-[12px] ${OVERLAY}`}
      >
        {(["zoom-in-16", "zoom-out-16", "fit-16"] as const).map((icon, i) => (
          <span
            key={icon}
            className={`flex size-10 items-center justify-center ${i < 2 ? "border-b border-slate-200" : ""}`}
          >
            <Icon name={icon} size={16} />
          </span>
        ))}
      </span>
      <MapLoadingCard />
    </div>
  );
}
