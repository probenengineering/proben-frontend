"use client";

import { Fragment } from "react";

import { Icon, Skeleton } from "@/components/atoms";
import { SEARCH_SCOPES, SearchResultRow, SearchSectionHeader } from "@/components/molecules";
import type { useGlobalSearch } from "@/hooks/useGlobalSearch";
import type { SearchScope } from "@/types/search";

// Body of the global search panel (Figma 60:14989 recent + quick actions, 60:15151 results,
// 60:15315 one scope, 60:15473 loading, 60:15643 no results).
export interface GlobalSearchResultsProps {
  s: ReturnType<typeof useGlobalSearch>;
}

const label = (scope: SearchScope) => SEARCH_SCOPES.find((x) => x.id === scope)?.label ?? scope;
const ACTION_TONES = {
  "clock-in": "green",
  tasks: "amber",
  shifts: "blue",
  message: "emerald",
} as const;
const ACTION_ICONS = {
  "clock-in": "search-clockin-18",
  tasks: "search-tasks-18",
  shifts: "search-schedule-18",
  message: "search-message-18",
} as const;

export function GlobalSearchResults({ s }: GlobalSearchResultsProps) {
  const q = s.query.trim();
  const rowProps = (i: number) => ({
    id: `search-row-${i}`,
    active: s.active === i,
    onHover: () => s.setActive(i),
    onSelect: () => s.choose(s.rows[i]),
  });

  if (s.loading) {
    return (
      <ul aria-busy className="flex flex-col">
        {[220, 180, 240].map((w, i) => (
          <li
            key={w}
            className="flex items-center gap-3 px-2.5 py-2.5"
            style={{ opacity: 1 - i * 0.2 }}
          >
            <Skeleton className="size-8.5 rounded-[10px]" />
            <span className="flex flex-col gap-2">
              <Skeleton className="h-3" style={{ width: w }} />
              <Skeleton className="h-2.5 w-80 max-w-[60vw]" />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (s.searching && s.rows.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-col items-center gap-2 px-4 pt-7 pb-5 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-green-tint">
            <Icon name="search-empty-28" size={24} />
          </span>
          <p className="type-ui-16 font-semibold text-slate-900">
            {s.error ? "Search isn’t available right now" : `No results for “${q}”`}
          </p>
          <p className="type-ui-13 text-slate-500">
            {s.error ?? "Check the spelling, or search for a person, home, task or message."}
          </p>
        </div>
        <SearchSectionHeader title="Try instead" />
        <ul>
          <SearchResultRow
            {...rowProps(-1)}
            active={false}
            onSelect={() => s.go("/homes")}
            title="Browse all my homes"
            detail="Your assigned group homes"
            icon="home"
            tone="green"
          />
          <SearchResultRow
            {...rowProps(-2)}
            active={false}
            onSelect={() => s.go("/tasks")}
            title="View my tasks"
            detail="Everything assigned to you"
            icon="tasks"
            tone="amber"
          />
        </ul>
      </div>
    );
  }

  if (!s.searching) {
    return (
      <ul role="listbox" aria-label="Suggestions" className="flex flex-col">
        {s.recents.length > 0 && (
          <SearchSectionHeader
            title="Recent searches"
            action={{ label: "Clear", onClick: s.clearRecents }}
          />
        )}
        {s.rows.map((row, i) =>
          row.kind === "recent" ? (
            <SearchResultRow
              key={`r-${row.q}`}
              {...rowProps(i)}
              title={row.q}
              detail="Recent search"
              icon="recent"
              tone="grey"
            />
          ) : row.kind === "action" ? (
            <Fragment key={row.action.id}>
              {i === s.recents.length && <SearchSectionHeader title="Quick actions" />}
              <SearchResultRow
                {...rowProps(i)}
                title={row.action.title}
                detail={row.action.detail}
                icon={ACTION_ICONS[row.action.id]}
                tone={ACTION_TONES[row.action.id]}
                shortcut={row.action.shortcut}
              />
            </Fragment>
          ) : null,
        )}
      </ul>
    );
  }

  // Results: in "All", grouped with "Show all N"; in one scope, a flat list plus "Also found…".
  const others =
    s.scope === "all" || !s.counts
      ? []
      : (Object.entries(s.counts) as [SearchScope, number][]).filter(
          ([scope, n]) => scope !== "all" && scope !== s.scope && n > 0,
        );
  return (
    <ul role="listbox" aria-label="Results" className="flex flex-col">
      {s.rows.map((row, i) => {
        if (row.kind !== "result") return null;
        const prev = s.rows[i - 1];
        const newGroup = !prev || (prev.kind === "result" && prev.item.scope !== row.item.scope);
        const total = s.counts?.[row.item.scope] ?? 0;
        return (
          <Fragment key={row.item.id}>
            {newGroup && (
              <SearchSectionHeader
                title={
                  s.scope === "all" ? label(row.item.scope) : `${label(row.item.scope)} · ${total}`
                }
                action={
                  s.scope === "all" && total > 3
                    ? { label: `Show all ${total}`, onClick: () => s.setScope(row.item.scope) }
                    : undefined
                }
              />
            )}
            <SearchResultRow
              {...rowProps(i)}
              title={row.item.title}
              detail={row.item.detail}
              meta={row.item.meta}
              initials={row.item.initials}
              icon={row.item.icon}
              tone={row.item.tone}
              query={q}
            />
          </Fragment>
        );
      })}
      {others.length > 0 && (
        <li className="mt-1 flex items-center justify-between gap-3 rounded-[10px] bg-slate-50 px-2.5 py-2 type-ui-12-16 text-slate-500">
          <span>
            Also found{" "}
            {others.map(([scope, n]) => `${n} ${label(scope).toLowerCase()}`).join(" and ")} for “
            {q}”
          </span>
          <button
            type="button"
            onClick={() => s.setScope("all")}
            className="shrink-0 font-semibold text-green-ink hover:underline"
          >
            Show all results
          </button>
        </li>
      )}
    </ul>
  );
}
