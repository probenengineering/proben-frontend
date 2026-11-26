import { Icon } from "@/components/atoms";
import { HomeRowSkeleton, HomesStats, PageHeading } from "@/components/molecules";

// My homes while loading (Figma 60:13068): the heading with the refresh button and List / Map
// switch, the stats line with "—" and "Loading…", a static toolbar, then five skeleton rows
// fading from 100% to 40%. The /homes loading fallback.
const NAMES = [200, 170, 150, 190, 210];
const PILL =
  "flex h-9 items-center gap-1.5 rounded-full border border-grey-300 bg-white pr-2.5 pl-3 type-ui-13 font-medium";

function StaticFilter({ label, value }: { label: string; value: string }) {
  return (
    <span className={PILL}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
      <Icon name="chevron-down" size={16} />
    </span>
  );
}

export function HomesSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5" aria-busy aria-label="Loading homes">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5">
        <PageHeading
          title="My homes"
          description="View and manage the group homes assigned to you."
        />
        <div className="flex items-center gap-2.5" aria-hidden>
          <span className="flex size-9 items-center justify-center rounded-full border border-grey-300 bg-white">
            <Icon name="refresh-18" size={18} />
          </span>
          <span className="flex gap-0.5 rounded-full bg-slate-100 p-0.75 type-ui-13">
            <span className="flex h-7.5 items-center gap-1.5 rounded-full bg-white px-3.5 font-semibold text-slate-900">
              <Icon name="view-list-active-16" size={16} />
              List
            </span>
            <span className="flex h-7.5 items-center gap-1.5 px-3.5 font-medium text-slate-500">
              <Icon name="view-map-16" size={16} />
              Map
            </span>
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4 px-5 pt-4" aria-hidden>
        <HomesStats updated="Loading…" />
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex h-9 w-full items-center gap-2 rounded-full border border-grey-300 bg-white pr-2.5 pl-3.5 type-ui-14 text-grey-400 sm:w-85">
            <Icon name="search" size={16} />
            Search by name, address, city or ZIP
          </span>
          <StaticFilter label="Assignment" value="All" />
          <StaticFilter label="City" value="All" />
          <span className="flex-1" />
          <StaticFilter label="Sort" value="Name (A–Z)" />
        </div>
        <ul className="overflow-clip rounded-[12px] border border-slate-200 bg-white">
          {NAMES.map((w, i) => (
            <HomeRowSkeleton key={w} nameWidth={w} opacity={1 - i * 0.15} />
          ))}
        </ul>
      </div>
    </div>
  );
}
