"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";

import { MapCredit } from "@/components/atoms";
import { MapPin } from "@/components/molecules";
import { createBaseMap } from "@/lib/map-style";

// Small, still map on a home's Location card (Figma "Mini map" 60:13898): the base map centred on
// the home at street level, with the selected pin and its name in the middle. The map-land colour
// shows while the tiles load.
export interface MiniMapProps {
  lat: number;
  lng: number;
  label: string;
}

export function MiniMap({ lat, lng, label }: MiniMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let live = true;
    let map: Awaited<ReturnType<typeof createBaseMap>> | null = null;
    createBaseMap(el, { center: [lng, lat], zoom: 14, interactive: false })
      .then((m) => {
        map = m;
        if (live) setReady(true);
        else m.remove();
      })
      .catch(() => {});
    return () => {
      live = false;
      map?.remove();
    };
  }, [lat, lng]);

  return (
    <div className="relative h-full w-full bg-map-land">
      <div ref={ref} className="absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[22px] transition-opacity"
        style={{ opacity: ready ? 1 : 0.6 }}
      >
        <MapPin label={label} selected />
      </div>
      <MapCredit />
    </div>
  );
}
