"use client";

import { Icon, KeyHint } from "@/components/atoms";
import { SearchFooter, SearchScopeTabs } from "@/components/molecules";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

import { GlobalSearchResults } from "./GlobalSearchResults";

// Global search (Figma 60:14989 – 60:15643), mounted once in the app shell. Opens on ⌘K / Ctrl K or
// from the header's search box. Desktop: a 640px search field over the header (green-500 1.5px
// border, 12px radius, 4px green glow) and an 8px-lower panel (16px radius, slate-200 border,
// search shadow) over a slate-900/18 scrim, centred over the content (beside the 272px / 82px
// sidebar). Phones: full screen.
export function GlobalSearch() {
  const s = useGlobalSearch();
  if (!s.open) return null;

  const resultCount = s.counts?.[s.scope] ?? 0;
  const note = s.loading
    ? "Searching…"
    : !s.searching
      ? "Searches all of Proben"
      : s.scope === "all"
        ? `${resultCount} ${resultCount === 1 ? "result" : "results"}`
        : `Scope: ${s.scope[0].toUpperCase()}${s.scope.slice(1)}`;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label="Search">
      <div className="absolute inset-0 bg-slate-900/18" onClick={() => s.setOpen(false)} />
      <div className="absolute inset-0 flex flex-col bg-white md:inset-auto md:top-7.75 md:left-[calc(50%+41px)] md:w-160 md:max-w-[calc(100%-2rem)] md:-translate-x-1/2 md:gap-2 md:bg-transparent lg:left-[calc(50%+136px)]">
        <div className="flex h-11.5 shrink-0 items-center gap-2.5 border-b border-slate-200 bg-white pr-3 pl-4 md:rounded-[12px] md:border-[1.5px] md:border-green-500 md:shadow-[0_0_0_4px_rgb(133_196_64/0.2)]">
          {s.loading ? (
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent"
            />
          ) : (
            <Icon name="search" size={16} />
          )}
          <input
            autoFocus
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            onKeyDown={s.onKeyDown}
            placeholder="Search people, messages, homes, tasks…"
            aria-label="Search"
            aria-activedescendant={`search-row-${s.active}`}
            className="min-w-0 flex-1 bg-transparent type-ui-14 font-medium text-slate-900 caret-green-ink outline-none placeholder:font-normal placeholder:text-grey-400"
          />
          {s.loading && <span className="type-ui-12-16 text-slate-500">Searching…</span>}
          {s.query && !s.loading && (
            <button
              type="button"
              onClick={() => s.setQuery("")}
              className="rounded-[6px] bg-slate-100 px-2 py-1 type-ui-12-16 font-medium text-slate-500"
            >
              Clear
            </button>
          )}
          <button type="button" onClick={() => s.setOpen(false)} aria-label="Close search">
            <KeyHint>esc</KeyHint>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-clip bg-white md:max-h-[min(571px,calc(100dvh-7rem))] md:flex-none md:rounded-[16px] md:border md:border-slate-200 md:shadow-search">
          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pt-3 pb-2.5">
            <SearchScopeTabs value={s.scope} onChange={s.setScope} counts={s.counts} />
            <div className="h-px bg-slate-200" />
            <GlobalSearchResults s={s} />
          </div>
          <SearchFooter note={note} />
        </div>
      </div>
    </div>
  );
}
