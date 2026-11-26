import { StatePill } from "@/components/atoms";
import { Breadcrumb, DetailTabs, PageHeading } from "@/components/molecules";
import type { ReactNode } from "react";

import type { HomeTab } from "@/lib/home-detail";
import type { AssignedHome } from "@/types/home";

// Home detail page, Overview tab (Figma 60:13792): breadcrumb, title + address, and on the right
// "GH-1042 · Home status Active · Your assignment Active"; the tabs
// (?tab=team|schedule|updates|resources), then the selected tab's content.
export interface HomeDetailViewProps {
  home: AssignedHome;
  tab: HomeTab;
  /** The selected tab's content. */
  children: ReactNode;
}

const TABS: { id: HomeTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "team", label: "Home team" },
  { id: "schedule", label: "Home schedule" },
  { id: "updates", label: "Home updates" },
  { id: "resources", label: "Resources" },
];

const SEP = <span className="type-ui-13 text-grey-400">·</span>;

export function HomeDetailView({ home, tab, children }: HomeDetailViewProps) {
  const base = `/homes/${encodeURIComponent(home.id)}`;
  const pill = (
    <StatePill tone={home.assignment.status === "upcoming" ? "info" : "success"}>
      {home.assignment.label}
    </StatePill>
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 flex-col">
          <Breadcrumb parent={{ label: "My homes", href: "/homes" }} current={home.name} />
          <PageHeading
            title={home.name}
            description={[home.street, home.cityLine].filter(Boolean).join(", ")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 type-ui-13 text-slate-500">
          {home.code && <span className="font-medium">{home.code}</span>}
          {home.code && SEP}
          <span className="flex items-center gap-2 whitespace-nowrap">
            Home status <StatePill tone="success">Active</StatePill>
          </span>
          {SEP}
          <span className="flex items-center gap-2 whitespace-nowrap">Your assignment {pill}</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 px-5 pt-4">
        <DetailTabs
          selected={tab}
          tabs={TABS.map((t) => ({
            ...t,
            href: t.id === "overview" ? base : `${base}?tab=${t.id}`,
          }))}
        />
        {children}
      </div>
    </div>
  );
}
