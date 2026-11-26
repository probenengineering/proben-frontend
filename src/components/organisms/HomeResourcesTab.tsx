"use client";

import { useState } from "react";

import { PillSearch, RESOURCE_COLUMNS, ResourceRow } from "@/components/molecules";
import type { HomeResource } from "@/types/home";

import { FilePreviewDialog } from "./FilePreviewDialog";

// Resources tab (Figma 60:14528): "Search resources" (280px) and "8 resources" on the right, then
// a 14px-radius table (slate-50 header: Name, Updated, Size) of files. The eye opens the preview
// (60:14744), the arrow downloads. Category, descriptions and "Restricted" have no API data yet.
export interface HomeResourcesTabProps {
  resources: HomeResource[];
}

const HEADER = "type-ui-12 font-medium text-slate-500";

export function HomeResourcesTab({ resources }: HomeResourcesTabProps) {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<HomeResource | null>(null);
  const q = query.trim().toLowerCase();
  const shown = resources.filter((r) => !q || r.name.toLowerCase().includes(q));

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <PillSearch
          value={query}
          onChange={setQuery}
          placeholder="Search resources"
          className="w-full sm:w-70"
        />
        <span className="flex-1" />
        <span className="type-ui-13 text-slate-500">
          {resources.length} {resources.length === 1 ? "resource" : "resources"}
        </span>
      </div>
      <div className="overflow-clip rounded-[14px] border border-slate-200 bg-white">
        <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <span className="w-9 shrink-0" />
          <span className={`${RESOURCE_COLUMNS.name} ${HEADER}`}>Name</span>
          <span className={`${RESOURCE_COLUMNS.updated} ${HEADER}`}>Updated</span>
          <span className={`${RESOURCE_COLUMNS.size} ${HEADER}`}>Size</span>
          <span className="w-20 shrink-0" />
        </div>
        {shown.length === 0 ? (
          <p className="px-4 py-10 text-center type-ui-14 text-slate-500">
            {resources.length === 0
              ? "No resources for this home yet."
              : "No resources match your search."}
          </p>
        ) : (
          <ul>
            {shown.map((r) => (
              <ResourceRow
                key={r.id}
                resource={r}
                selected={preview?.id === r.id}
                onPreview={() => setPreview(r)}
              />
            ))}
          </ul>
        )}
      </div>
      <FilePreviewDialog resource={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
