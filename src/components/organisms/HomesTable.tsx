import { HomeRow, HomeTableHeader } from "@/components/molecules";
import type { AssignedHome } from "@/types/home";

// My homes list (Figma "Homes list" 60:12884): white, slate-200 border, 12px radius, slate-50
// column header, one HomeRow per home. "View details" opens that home's profile panel.
export interface HomesTableProps {
  homes: AssignedHome[];
  /** Link for a row, e.g. (id) => `/homes?home=${id}`. */
  hrefFor: (id: string) => string;
  selectedId?: string;
}

export function HomesTable({ homes, hrefFor, selectedId }: HomesTableProps) {
  return (
    <div className="w-full overflow-clip rounded-[12px] border border-slate-200 bg-white">
      <HomeTableHeader />
      <ul className="flex w-full flex-col">
        {homes.map((home) => (
          <HomeRow
            key={home.id}
            home={home}
            href={hrefFor(home.id)}
            selected={home.id === selectedId}
          />
        ))}
      </ul>
    </div>
  );
}
