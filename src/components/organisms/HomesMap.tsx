"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useState } from "react";

import { Icon, MapCredit } from "@/components/atoms";
import {
  ClusterList,
  MapControls,
  MapHomeCard,
  MapLoadingCard,
  MapNotice,
  MapPin,
} from "@/components/molecules";
import { useHomesMap } from "@/hooks/useHomesMap";
import type { AssignedHome } from "@/types/home";

// My homes map view (Figma 60:13347; pin selected 60:13450; cluster open 60:13575; loading
// 60:13699): a 600px map (slate-200 border, 16px radius) with the "4 of 5 homes on map" chip top
// left, zoom controls top right, the selected home's card top right (beside the controls), the
// grouped-homes list above an opened cluster, and the "Location unavailable" notice bottom left.
// Phones: the map is 480px, and the selected home's card sits across the bottom.
export interface HomesMapProps {
  homes: AssignedHome[];
  /** "Show in list view" / "View in list": back to the list, optionally searching one home. */
  onShowList: (home?: AssignedHome) => void;
}

const OVERLAY = "absolute z-10";

export function HomesMap({ homes, onShowList }: HomesMapProps) {
  const { container, ready, failed, clusters, zoomIn, zoomOut, fit, focus } = useHomesMap(homes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openCluster, setOpenCluster] = useState<string | null>(null);
  const selected = homes.find((h) => h.id === selectedId) ?? null;
  const offMap = homes.filter((h) => !h.onMap || !h.coordinates);
  const onMapCount = homes.length - offMap.length;

  const select = (home: AssignedHome) => {
    setSelectedId(home.id);
    setOpenCluster(null);
    focus(home);
  };

  return (
    <div className="relative h-120 overflow-clip rounded-[16px] border border-slate-200 bg-map-land md:h-150">
      <div
        ref={container}
        className="absolute inset-0"
        onPointerDown={() => setOpenCluster(null)}
      />

      {ready &&
        clusters.map((c) => {
          const single = c.homes.length === 1;
          const isSelected = single && c.homes[0].id === selectedId;
          return (
            <div
              key={c.key}
              className="absolute z-[5]"
              style={{
                left: c.x,
                top: c.y,
                transform: `translate(-50%, ${isSelected ? -22 : -18}px)`,
              }}
            >
              <button
                type="button"
                aria-label={single ? c.homes[0].name : `${c.homes.length} homes`}
                onClick={() =>
                  single ? select(c.homes[0]) : setOpenCluster(openCluster === c.key ? null : c.key)
                }
              >
                <MapPin
                  label={single ? c.homes[0].name.split(" ")[0] : `${c.homes.length} homes`}
                  selected={isSelected}
                  count={single ? undefined : c.homes.length}
                />
              </button>
              {openCluster === c.key && (
                <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2">
                  <ClusterList homes={c.homes} onSelect={select} />
                </div>
              )}
            </div>
          );
        })}

      <span
        className={`${OVERLAY} top-3 left-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.75 type-ui-13 font-semibold text-slate-900 shadow-map-overlay`}
      >
        <Icon name="stat-homes-16" size={16} />
        {ready ? `${onMapCount} of ${homes.length} homes on map` : "Loading homes…"}
      </span>

      <div className={`${OVERLAY} top-3 right-3`}>
        <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onFit={fit} />
      </div>

      {selected && (
        <div
          className={`${OVERLAY} right-3 bottom-3 left-3 md:top-3 md:right-16 md:bottom-auto md:left-auto`}
        >
          <MapHomeCard
            home={selected}
            onClose={() => setSelectedId(null)}
            onShowInList={() => onShowList(selected)}
          />
        </div>
      )}

      {ready && offMap.length > 0 && !selected && (
        <div className={`${OVERLAY} right-3 bottom-6 left-3 md:right-auto`}>
          <MapNotice names={offMap.map((h) => h.name)} onViewList={() => onShowList()} />
        </div>
      )}

      <MapCredit />

      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {failed ? (
            <p className="rounded-[16px] bg-white px-7 py-5.5 type-ui-14 text-slate-500 shadow-map-overlay">
              The map couldn’t load. Check your connection and try again.
            </p>
          ) : (
            <MapLoadingCard />
          )}
        </div>
      )}
    </div>
  );
}
