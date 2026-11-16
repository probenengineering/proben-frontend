import { HomeRow, HomeTableHeader } from "@/components/molecules";
import type { AssignedHome } from "@/types/home";

// My Homes list view (Figma 51:12496): white table, 16px radius, white-400 border. Each row
// opens that home's profile panel; compact = narrower columns while the panel is open.
export interface HomesTableProps {
  homes: AssignedHome[];
  /** Link for a row, e.g. (id) => `/homes?home=${id}`. */
  hrefFor: (id: string) => string;
  selectedId?: string;
  compact?: boolean;
}

export function HomesTable({ homes, hrefFor, selectedId, compact }: HomesTableProps) {
  return (
    <div className="w-full overflow-clip rounded-[16px] border border-white-400 bg-white">
      <HomeTableHeader compact={compact} />
      <ul className="flex w-full flex-col">
        {homes.map((home) => (
          <HomeRow
            key={home.id}
            home={home}
            href={hrefFor(home.id)}
            selected={home.id === selectedId}
            compact={compact}
          />
        ))}
      </ul>
    </div>
  );
}
