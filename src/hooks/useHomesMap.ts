"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import { createBaseMap } from "@/lib/map-style";
import type { AssignedHome } from "@/types/home";

// The My homes map (Figma 60:13347): creates the MapLibre map in `container`, fits it to the
// homes, and keeps their screen positions in state as the map moves. Homes whose pins would
// overlap (within 48px) merge into one cluster ("2 homes", 60:13424).

const CLUSTER_PX = 48;

export interface MapCluster {
  key: string;
  x: number;
  y: number;
  homes: AssignedHome[];
}

const located = (h: AssignedHome) => h.onMap && !!h.coordinates;

export function useHomesMap(homes: AssignedHome[]) {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [failed, setFailed] = useState(false);
  const firstCenter = useRef(homes.find(located)?.coordinates);
  const key = homes
    .filter(located)
    .map((h) => h.id)
    .join(",");

  // Create the map once.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let live = true;
    let created: MapLibreMap | null = null;
    const c = firstCenter.current;
    createBaseMap(el, { center: c ? [c.lng, c.lat] : [-89.4, 43.07] })
      .then((m) => {
        created = m;
        if (live) setMap(m);
        else m.remove();
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
      created?.remove();
    };
  }, []);

  const fit = useCallback(
    (instant = false) => {
      if (!map) return;
      const duration = instant ? 0 : undefined;
      const points = homes
        .filter(located)
        .map((h) => [h.coordinates!.lng, h.coordinates!.lat] as [number, number]);
      if (points.length === 0) return;
      if (points.length === 1) {
        map.easeTo({ center: points[0], zoom: 14, duration });
        return;
      }
      const lngs = points.map((p) => p[0]);
      const lats = points.map((p) => p[1]);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 96, maxZoom: 14, duration },
      );
    },
    [map, homes],
  );

  // Fit to the homes when the map is ready or the shown homes change.
  const fitted = useRef("");
  useEffect(() => {
    if (!map || fitted.current === key) return;
    fitted.current = key;
    // The container may have settled after the map was created; measure before fitting.
    map.resize();
    fit(true);
  }, [map, key, fit]);

  // Recompute pin positions and clusters as the map moves.
  useEffect(() => {
    if (!map) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next: MapCluster[] = [];
        for (const home of homes.filter(located)) {
          const { x, y } = map.project([home.coordinates!.lng, home.coordinates!.lat]);
          const near = next.find((c) => Math.hypot(c.x - x, c.y - y) < CLUSTER_PX);
          if (near) near.homes.push(home);
          else next.push({ key: home.id, x, y, homes: [home] });
        }
        setClusters(next);
      });
    };
    update();
    map.on("move", update);
    map.on("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      map.off("move", update);
      map.off("resize", update);
    };
  }, [map, homes]);

  return {
    container,
    ready: !!map,
    failed,
    clusters,
    zoomIn: () => map?.zoomIn(),
    zoomOut: () => map?.zoomOut(),
    fit: () => fit(),
    focus: (home: AssignedHome) => {
      if (!map || !home.coordinates) return;
      // Pan only, so the other homes stay in view (Figma 60:13450).
      // On phones the home's card covers the bottom of the map, so the pin goes higher up.
      const phone = map.getContainer().clientWidth < 640;
      map.easeTo({
        center: [home.coordinates.lng, home.coordinates.lat],
        offset: phone ? [0, -110] : [0, 0],
      });
    },
  };
}
