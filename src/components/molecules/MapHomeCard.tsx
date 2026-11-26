import Link from "next/link";

import { Button, Icon, StatePill } from "@/components/atoms";
import type { AssignedHome } from "@/types/home";

// Selected home on the map (Figma "Selected home preview" 60:13553): 340px, white, 16px radius,
// 18px padding, 14px gaps, map-overlay shadow. 40px green tile + name (Inter Semi Bold 16/24) over
// the code + a 32px slate-50 close; street (14/20 grey-700) over the city line (13/18 slate-500);
// the assignment pill and role; then "View home details" (38px green pill) and "Show in list view"
// (Semi Bold 13/18 green-ink).
export interface MapHomeCardProps {
  home: AssignedHome;
  onClose: () => void;
  onShowInList: () => void;
}

export function MapHomeCard({ home, onClose, onShowInList }: MapHomeCardProps) {
  return (
    <div className="flex w-full flex-col gap-3.5 rounded-[16px] bg-white p-4.5 shadow-map-overlay">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-green-500/12">
          <Icon name="home-green-20" size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate type-ui-16-24 font-semibold text-slate-900">{home.name}</p>
          {home.code && <p className="type-ui-12 text-slate-500">{home.code}</p>}
        </div>
        <button
          type="button"
          aria-label="Back to map"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100"
        >
          <Icon name="clear-16" size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="type-ui-14 text-grey-700">{home.street ?? home.address}</p>
        {home.cityLine && <p className="type-ui-13 text-slate-500">{home.cityLine}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatePill tone={home.assignment.status === "upcoming" ? "info" : "success"}>
          {home.assignment.label}
        </StatePill>
        {home.role && <span className="type-ui-13 text-slate-500">{home.role}</span>}
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="green"
          size="pill"
          className="h-9.5 w-full px-4"
          render={<Link href={`/homes/${encodeURIComponent(home.id)}`} />}
          nativeButton={false}
        >
          View home details
        </Button>
        <button
          type="button"
          onClick={onShowInList}
          className="type-ui-13 font-semibold text-green-ink hover:underline"
        >
          Show in list view
        </button>
      </div>
    </div>
  );
}
