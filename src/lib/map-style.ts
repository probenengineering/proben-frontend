"use client";

import type { Map as MapLibreMap } from "maplibre-gl";

// Base map for My homes (Figma "Map Canvas" 60:13421): MapLibre with OpenFreeMap's "positron"
// vector tiles (free, no key), recoloured to the Figma palette from our tokens: map-land
// background, map-water, map-park greens, white roads, grey-400 place names and map-label-water
// lake names. MapLibre loads only when a map is shown. The tile server sees the area viewed.

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();

function recolour(map: MapLibreMap) {
  const land = token("map-land");
  const water = token("map-water");
  const park = token("map-park");
  const label = token("grey-400");
  const waterLabel = token("map-label-water");
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id.toLowerCase();
    try {
      if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", land);
      else if (layer.type === "fill" && id.includes("water"))
        map.setPaintProperty(layer.id, "fill-color", water);
      else if (layer.type === "fill" && /park|landcover|wood|grass|forest|green/.test(id))
        map.setPaintProperty(layer.id, "fill-color", park);
      else if (layer.type === "fill" && /landuse|building/.test(id))
        map.setPaintProperty(layer.id, "fill-color", land);
      else if (layer.type === "line" && /road|highway|street|transport|bridge|tunnel/.test(id))
        map.setPaintProperty(layer.id, "line-color", "#ffffff");
      else if (layer.type === "symbol")
        map.setPaintProperty(layer.id, "text-color", id.includes("water") ? waterLabel : label);
    } catch {
      // Some layers don't take a property; leave them as the style draws them.
    }
  }
}

export interface BaseMapOptions {
  center: [number, number];
  zoom?: number;
  interactive?: boolean;
}

/** Creates the map in `container`; resolves once the style is loaded and recoloured. */
export async function createBaseMap(container: HTMLElement, options: BaseMapOptions) {
  const { Map, getWorkerUrl, setWorkerUrl } = await import("maplibre-gl");
  // MapLibre parses tiles in a module worker; point it at the package's worker file, which the
  // bundler serves as an asset.
  if (!getWorkerUrl()) {
    setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
  }
  const map = new Map({
    container,
    style: STYLE_URL,
    center: options.center,
    zoom: options.zoom ?? 11,
    interactive: options.interactive ?? true,
    // The credit line is drawn by MapCredit (MapLibre's own box covers the overlays).
    attributionControl: false,
  });
  await new Promise<void>((resolve) => map.once("load", () => resolve()));
  recolour(map);
  return map;
}
