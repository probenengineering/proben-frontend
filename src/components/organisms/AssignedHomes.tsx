import type { HomesView } from "@/components/molecules";
import { getAssignedHomes } from "@/lib/homes";

import { HomesBrowser } from "./HomesBrowser";

// My homes body (Figma 60:12810 list, 60:13347 map): loads GET /homes and renders the browser.
// ?view=map opens the map view ("View on map" on a home's page). No homes → "No homes assigned
// yet" (60:13202); a failed load → "Unable to load your homes" (60:13274). Reads the session, so
// render it inside <Suspense>.
export interface AssignedHomesProps {
  searchParams: Promise<{ view?: string | string[] }>;
}

export async function AssignedHomes({ searchParams }: AssignedHomesProps) {
  const [{ homes, error, loadedAt }, params] = await Promise.all([
    getAssignedHomes(),
    searchParams,
  ]);
  const view: HomesView = params.view === "map" ? "map" : "list";

  return (
    <HomesBrowser
      homes={homes}
      loadedAt={loadedAt}
      initialView={view}
      status={error ? "error" : homes.length === 0 ? "empty" : "ready"}
    />
  );
}
