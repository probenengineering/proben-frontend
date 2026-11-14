"use client";

import { FilterDropdown, type FilterListItem, FilterOptionList } from "@/components/molecules";
import type { InboxFilters } from "@/lib/messaging/filters";
import { avatarFor } from "@/lib/messaging/mappers";
import type { FilterCatalog } from "@/lib/messaging/types";

// "People and Teams" in the filter menu: All teams / All homes / All roles. Options come from
// GET /conversations/filters; picking one keeps chats where another person matches (all picks
// together, by the same person). "All …" removes that filter.

export interface PeopleFilterProps {
  filters: InboxFilters;
  /** null without directory permission. */
  catalog: FilterCatalog | null;
  update: (change: Partial<InboxFilters>) => void;
}

// Nothing to pick → no rows, so the list shows its empty message.
function list(all: string, options: { id: string; name: string }[], avatars: boolean) {
  if (options.length === 0) return [];
  return [
    { id: "", label: all },
    ...options.map((o, i): FilterListItem => ({
      id: o.id,
      label: o.name,
      avatar: avatars ? avatarFor(o.id, o.name) : undefined,
      separatorBefore: i === 0,
    })),
  ];
}

const labelOf = (all: string, options: { id: string; name: string }[], id: string) =>
  options.find((o) => o.id === id)?.name ?? all;

export function PeopleFilter({ filters, catalog, update }: PeopleFilterProps) {
  const empty = catalog ? "None available" : "You don't have access to the staff directory";
  const homes = catalog?.homes ?? [];
  // Once a home is picked, only its teams are offered (others couldn't match the same person).
  const teams = (catalog?.teams ?? []).filter(
    (t) => !filters.homeId || t.homeId === filters.homeId,
  );
  const roles = catalog?.roles ?? [];
  return (
    <div className="flex w-60.75 flex-col gap-2">
      <FilterDropdown
        icon="profile-2user"
        label={labelOf("All teams", teams, filters.teamId)}
        alignOffset={23}
        panelClassName="w-67.75"
      >
        <FilterOptionList
          search
          items={list("All teams", teams, true)}
          selectedId={filters.teamId}
          onSelect={(teamId) => update({ teamId })}
          emptyLabel={empty}
        />
      </FilterDropdown>
      <FilterDropdown
        icon="home-linear"
        label={labelOf("All homes", homes, filters.homeId)}
        alignOffset={23}
        panelClassName="w-67.75"
      >
        <FilterOptionList
          search
          items={list("All homes", homes, true)}
          selectedId={filters.homeId}
          onSelect={(homeId) => {
            const team = catalog?.teams.find((t) => t.id === filters.teamId);
            // A team from another home can't match any more, so it's cleared.
            const keepTeam = !homeId || !team || team.homeId === homeId;
            update({ homeId, ...(keepTeam ? {} : { teamId: "" }) });
          }}
          emptyLabel={empty}
        />
      </FilterDropdown>
      <FilterDropdown
        icon="grid"
        label={labelOf("All roles", roles, filters.roleId)}
        panelClassName="w-60.75 gap-0"
      >
        <FilterOptionList
          checkboxes
          items={list("All roles", roles, false)}
          selectedId={filters.roleId}
          onSelect={(roleId) => update({ roleId })}
          emptyLabel={empty}
        />
      </FilterDropdown>
    </div>
  );
}
