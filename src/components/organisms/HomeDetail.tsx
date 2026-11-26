import { EmptyNotice } from "@/components/molecules";
import { getHomeDetail, type HomeTab } from "@/lib/home-detail";

import { HomeDetailView } from "./HomeDetailView";
import { HomeOverviewTab } from "./HomeOverviewTab";
import { HomeResourcesTab } from "./HomeResourcesTab";
import { HomeScheduleTab } from "./HomeScheduleTab";
import { HomeTeamTab } from "./HomeTeamTab";
import { HomeUpdatesTab } from "./HomeUpdatesTab";

// Loads a home (GET /homes) and its team (GET /homes/{id}/team) for its page (Figma 60:13792).
// Not one of your homes, or the load failed: a notice instead. Reads the session, so render it
// inside <Suspense>.
export interface HomeDetailProps {
  id: string;
  tab?: HomeTab;
  /** Home schedule: the selected day ("2026-10-25"). */
  day?: string;
}

const TAB_NAMES: Record<HomeTab, string> = {
  overview: "overview",
  team: "team",
  schedule: "schedule",
  updates: "updates",
  resources: "resources",
};

export async function HomeDetail({ id, tab = "overview", day }: HomeDetailProps) {
  const { home, team, schedule, updates, resources, error } = await getHomeDetail(id, tab, day);
  if (!home) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <EmptyNotice
          title={error ? "Couldn't load this home" : "Home not found"}
          description={error ?? "It may no longer be assigned to you."}
        />
      </div>
    );
  }
  // Team, schedule, updates and resources open once your assignment starts (the backend refuses
  // them before then), so an upcoming home says when instead of showing empty lists.
  // No Figma frame: built from EmptyNotice.
  if (home.assignment.status === "upcoming" && tab !== "overview") {
    return (
      <HomeDetailView home={home} tab={tab}>
        <div className="flex flex-1 items-center justify-center py-20">
          <EmptyNotice
            title="Available when your assignment starts"
            description={
              home.assignment.label.startsWith("Starts")
                ? `Your assignment ${home.assignment.label.replace("Starts", "starts")}. You'll see this home's ${TAB_NAMES[tab]} from then.`
                : `Your assignment hasn't started yet. You'll see this home's ${TAB_NAMES[tab]} once it does.`
            }
          />
        </div>
      </HomeDetailView>
    );
  }
  return (
    <HomeDetailView home={home} tab={tab}>
      {tab === "team" ? (
        <HomeTeamTab team={team} />
      ) : tab === "schedule" && schedule ? (
        <HomeScheduleTab homeId={home.id} {...schedule} />
      ) : tab === "resources" ? (
        <HomeResourcesTab resources={resources ?? []} />
      ) : tab === "updates" ? (
        <HomeUpdatesTab home={home} updates={updates ?? []} />
      ) : (
        <HomeOverviewTab home={home} team={team} />
      )}
    </HomeDetailView>
  );
}
