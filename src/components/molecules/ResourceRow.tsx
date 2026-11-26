import { Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { HomeResource } from "@/types/home";

// A file on the Resources tab (Figma "Resource / …" 60:14603): 16 × 12 padding, 16px gaps,
// slate-200 divider. 36px tile (10px radius) with an 18px file icon, name (Inter Semi Bold 14/20
// slate-900), updated date and size (13/18 slate-500), then 32px icon buttons: preview (PDFs and
// images only) and download. Tile colours by file type: PDF red, spreadsheet green, document blue.
export const RESOURCE_COLUMNS = {
  name: "min-w-0 flex-1",
  updated: "hidden w-27.5 shrink-0 sm:block",
  size: "hidden w-20 shrink-0 sm:block",
  actions: "flex w-20 shrink-0 justify-end gap-1",
};

const TILES: Record<HomeResource["kind"], { tile: string; icon: IconName }> = {
  pdf: { tile: "bg-danger-50", icon: "file-red-18" },
  image: { tile: "bg-danger-50", icon: "file-red-18" },
  sheet: { tile: "bg-verified-50", icon: "file-green-18" },
  doc: { tile: "bg-info-50", icon: "file-blue-18" },
  other: { tile: "bg-slate-100", icon: "file-blue-18" },
};

export const canPreview = (r: HomeResource) => r.kind === "pdf" || r.kind === "image";
export const fileHref = (r: HomeResource, inline = false) =>
  `/api/files/${encodeURIComponent(r.fileId)}?name=${encodeURIComponent(r.name)}${inline ? "&inline=1" : ""}`;

const BUTTON = "flex size-8 items-center justify-center rounded-[8px] hover:bg-slate-100";

export interface ResourceRowProps {
  resource: HomeResource;
  onPreview: () => void;
  selected?: boolean;
}

export function ResourceRow({ resource: r, onPreview, selected }: ResourceRowProps) {
  const tile = TILES[r.kind];
  return (
    <li
      className={cn(
        "flex items-center gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0",
        selected ? "bg-slate-50" : "bg-white",
      )}
    >
      <span
        className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px]", tile.tile)}
      >
        <Icon name={tile.icon} size={18} />
      </span>
      <p className={cn("truncate type-ui-14 font-semibold text-slate-900", RESOURCE_COLUMNS.name)}>
        {r.name}
      </p>
      <span className={cn("type-ui-13 text-slate-500", RESOURCE_COLUMNS.updated)}>{r.updated}</span>
      <span className={cn("type-ui-13 text-slate-500", RESOURCE_COLUMNS.size)}>
        {r.size ?? "—"}
      </span>
      <span className={RESOURCE_COLUMNS.actions}>
        {canPreview(r) && (
          <button
            type="button"
            aria-label={`Preview ${r.name}`}
            onClick={onPreview}
            className={BUTTON}
          >
            <Icon name="view-18" size={18} />
          </button>
        )}
        <a href={fileHref(r)} aria-label={`Download ${r.name}`} className={BUTTON}>
          <Icon name="download-18" size={18} />
        </a>
      </span>
    </li>
  );
}
