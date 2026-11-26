import { InfoCard } from "@/components/molecules";
import type { AssignedHome, HomeTeamMember } from "@/types/home";

import { HomeTeamCard } from "./HomeTeamCard";
import { MiniMapCard } from "./MiniMapCard";

// Home page, Overview tab (Figma 60:13792): General information and Your assignment on the left,
// Location and Home team (first three, "View all" opens the Home team tab) on the right.
export interface HomeOverviewTabProps {
  home: AssignedHome;
  team: HomeTeamMember[];
}

export function HomeOverviewTab({ home, team }: HomeOverviewTabProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <InfoCard
          title="General information"
          fields={[
            { label: "Address", value: home.street },
            { label: "City", value: home.city },
            { label: "State", value: home.region },
            { label: "ZIP code", value: home.postalCode },
            { label: "Home ID", value: home.code },
            { label: "Home status", value: "Active" },
          ]}
        />
        <InfoCard
          title="Your assignment"
          fields={[
            { label: "Role", value: home.role },
            { label: "Assignment status", value: home.assignment.label },
            { label: "Assigned since", value: home.assignedSince },
            { label: "Home manager" },
            { label: "Usual shift" },
            { label: "Next shift", value: home.nextShift },
          ]}
        />
      </div>
      <div className="flex w-full flex-col gap-4 lg:w-90">
        <MiniMapCard home={home} />
        <HomeTeamCard team={team} href={`/homes/${encodeURIComponent(home.id)}?tab=team`} />
      </div>
    </div>
  );
}
