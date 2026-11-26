import Link from "next/link";

import { Icon, StatePill } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { AssignedHome } from "@/types/home";

import { HOME_TABLE_COLUMNS } from "./HomeTableHeader";

// One home in the My homes table (Figma "Home / …" 60:12892): 16 × 14 padding, 16px gaps,
// slate-200 divider. 40px green-500/12 tile (12px radius) with a 20px house; name Inter Semi Bold
// 14/20 slate-900 over the code (12/18 slate-500); street (14/20 grey-700) over city line (12/18
// slate-500, "· Not on map" when there are no coordinates); assignment pill (Active / Starts …);
// role (13/18 slate-500); "View details →" (Semi Bold 13/18 green-ink) opens the home's page.
// Phones: icon, name and code, the pill and just the arrow (no column header).
export interface HomeRowProps {
  home: AssignedHome;
  href: string;
  selected?: boolean;
}

export function HomeRow({ home, href, selected }: HomeRowProps) {
  const cityLine = [home.cityLine, !home.onMap && "Not on map"].filter(Boolean).join(" · ");
  return (
    <li className="border-b border-slate-200 last:border-b-0">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3.5 md:gap-4",
          selected ? "bg-green-tint" : "bg-white",
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-[12px] bg-green-500/12",
            HOME_TABLE_COLUMNS.icon,
          )}
        >
          <Icon name="home-green-20" size={20} />
        </span>
        <span className={cn("flex min-w-0 flex-col gap-0.5", HOME_TABLE_COLUMNS.home)}>
          <span className="truncate type-ui-14 font-semibold text-slate-900">{home.name}</span>
          {home.code && <span className="type-ui-12 text-slate-500">{home.code}</span>}
        </span>
        <span className={cn("min-w-0 flex-col gap-0.5", HOME_TABLE_COLUMNS.address)}>
          <span className="truncate type-ui-14 text-grey-700">{home.street ?? "—"}</span>
          {cityLine && <span className="truncate type-ui-12 text-slate-500">{cityLine}</span>}
        </span>
        <span className={cn("flex", HOME_TABLE_COLUMNS.assignment)}>
          <StatePill tone={home.assignment.status === "upcoming" ? "info" : "success"}>
            {home.assignment.label}
          </StatePill>
        </span>
        <span className={cn("truncate type-ui-13 text-slate-500", HOME_TABLE_COLUMNS.role)}>
          {home.role ?? "—"}
        </span>
        <Link
          href={href}
          scroll={false}
          aria-current={selected ? "true" : undefined}
          aria-label={`View details for ${home.name}`}
          className={cn(
            "flex items-center gap-1.5 type-ui-13 font-semibold text-green-ink hover:underline",
            HOME_TABLE_COLUMNS.action,
          )}
        >
          <span className="hidden sm:inline">View details</span>
          <Icon name="arrow-right-green-16" size={16} />
        </Link>
      </div>
    </li>
  );
}
