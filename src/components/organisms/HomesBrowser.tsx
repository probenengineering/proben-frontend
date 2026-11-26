"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Icon } from "@/components/atoms";
import {
  type HomesView,
  HomesStats,
  PageHeading,
  TaskTableEmpty,
  ViewSwitch,
} from "@/components/molecules";
import { useHomesFilters } from "@/hooks/useHomesFilters";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { cn } from "@/lib/utils";
import type { AssignedHome } from "@/types/home";

import { HomesMapLoading } from "./HomesMapLoading";

// MapLibre is only downloaded when the map view opens; the loading state shows meanwhile.
const HomesMap = dynamic(() => import("./HomesMap").then((mod) => mod.HomesMap), {
  ssr: false,
  loading: () => <HomesMapLoading />,
});
import { HomesTable } from "./HomesTable";
import { HomesToolbar } from "./HomesToolbar";

// My homes (Figma 60:12810 list, 60:12897 search, 60:12982 no results, 60:13202 no homes,
// 60:13274 load failed, 60:13699 map loading): heading
// with a refresh button and the List / Map switch; the stats line ("5 assigned homes · …"); the
// toolbar; then the table, the map, or "No homes found". "View details" opens the home's page.
export interface HomesBrowserProps {
  homes: AssignedHome[];
  loadedAt?: number;
  initialView?: HomesView;
  /** "empty": no homes assigned (60:13202). "error": the load failed (60:13274). */
  status?: "ready" | "empty" | "error";
}

const CARD = "rounded-[12px] border border-slate-200 bg-white pt-18 pb-20";

const hrefFor = (id: string) => `/homes/${encodeURIComponent(id)}`;

export function HomesBrowser({
  homes,
  loadedAt,
  initialView = "list",
  status = "ready",
}: HomesBrowserProps) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const updated = useRelativeTime(loadedAt);
  const f = useHomesFilters(homes, initialView);
  // "4 locations" in Figma = homes with coordinates (4 of 5 on the map, 60:13347).
  const locations = homes.filter((h) => h.onMap).length;
  const failed = status === "error";
  const refresh = () => startRefresh(() => router.refresh());

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5">
        <PageHeading
          title="My homes"
          description="View and manage the group homes assigned to you."
        />
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Refresh homes"
            disabled={refreshing}
            onClick={refresh}
            className="flex size-9 items-center justify-center rounded-full border border-grey-300 bg-white hover:bg-slate-50 disabled:opacity-60"
          >
            <span className={cn("flex", refreshing && "animate-spin")}>
              <Icon name="refresh-18" size={18} />
            </span>
          </button>
          <ViewSwitch value={f.view} onChange={f.setView} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 px-5 pt-4">
        <HomesStats
          homes={failed ? undefined : homes.length}
          active={failed ? undefined : homes.filter((h) => h.assignment.status === "active").length}
          locations={failed ? undefined : locations}
          updated={failed ? "Last attempt failed" : updated}
        />
        {status === "ready" && <HomesToolbar filters={f} total={homes.length} />}

        {failed ? (
          <TaskTableEmpty
            title="Unable to load your homes"
            message="We couldn’t retrieve your assigned homes. Please try again."
            actionLabel="Retry"
            tone="green"
            onAction={refresh}
            icon="load-error-28"
            iconClassName="rounded-full bg-danger-50"
            className={CARD}
          />
        ) : status === "empty" ? (
          <TaskTableEmpty
            title="No homes assigned yet"
            message="Your assigned group homes will appear here once a home manager adds you to a home."
            icon="homes-empty-28"
            iconClassName="rounded-full bg-green-tint"
            className={CARD}
          />
        ) : f.view === "map" ? (
          <HomesMap
            homes={f.shown}
            onShowList={(home) => {
              f.setView("list");
              if (home) f.setQuery(home.name);
            }}
          />
        ) : f.shown.length === 0 ? (
          <TaskTableEmpty
            title="No homes found"
            message="Try another home name or address."
            actionLabel="Clear search"
            onAction={f.clear}
            icon="search-empty-28"
            iconClassName="rounded-full bg-green-tint"
            className={CARD}
          />
        ) : (
          <HomesTable homes={f.shown} hrefFor={hrefFor} />
        )}
      </div>
    </div>
  );
}
