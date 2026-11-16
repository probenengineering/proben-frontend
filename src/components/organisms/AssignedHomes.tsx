import { EmptyNotice, PageHeading } from "@/components/molecules";
import { FlatPageTemplate } from "@/components/templates/FlatPageTemplate";
import { getAssignedHomes } from "@/lib/homes";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardTabs } from "./DashboardTabs";
import { HomeProfilePanel } from "./HomeProfilePanel";
import { HomesBrowser } from "./HomesBrowser";

// My Homes (Figma 51:11543 empty, 51:12496 list, 51:12782 list + profile, 51:12625 section).
// Reads the session and the ?home= search param, so render it inside <Suspense>.
// ?home=<id> opens that home's profile panel; ✕ links back without it. List / Section switch
// in place inside HomesBrowser.
export interface AssignedHomesProps {
  searchParams: Promise<{ home?: string | string[] }>;
}

export async function AssignedHomes({ searchParams }: AssignedHomesProps) {
  const [homes, params] = await Promise.all([getAssignedHomes(), searchParams]);
  const selected = homes.find((home) => home.id === params.home);

  return (
    <FlatPageTemplate
      header={<DashboardHeader greeting="Good afternoon, Alison" wideSearch />}
      tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="My Homes" />}
      panel={selected && <HomeProfilePanel home={selected} closeHref="/homes" />}
    >
      {homes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <EmptyNotice
            title="No group homes found"
            description="A group home will be assigned to you soon"
          />
        </div>
      ) : (
        <HomesBrowser
          homes={homes}
          selectedId={selected?.id}
          heading={
            <PageHeading
              title="Assigned homes"
              description="View your assigned care homes and their location"
            />
          }
        />
      )}
    </FlatPageTemplate>
  );
}
