"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  clearRecentSearchesAction,
  quickActionsAction,
  recentSearchesAction,
  saveRecentSearchAction,
  searchAction,
} from "@/lib/search-actions";
import type { QuickAction, SearchItem, SearchResults, SearchScope } from "@/types/search";

// Global search state (Figma 60:14989 – 60:15643). Opens on ⌘K / Ctrl K or the "proben:search"
// window event (the header's search box). Searches 250ms after typing stops (2+ characters);
// answers to older queries are dropped. ↑ ↓ move, ↵ opens, Tab / Shift+Tab switch scope, Esc closes.

export const OPEN_SEARCH_EVENT = "proben:search";
const SCOPES: SearchScope[] = ["all", "people", "messages", "homes", "tasks", "schedule", "files"];
const DEBOUNCE_MS = 250;
const PER_GROUP = 3;
export const GROUP_ORDER: SearchScope[] = [
  "people",
  "homes",
  "schedule",
  "messages",
  "tasks",
  "files",
];

/** A row the keyboard can reach: a result, a recent search or a quick action. */
export type SearchRow =
  | { kind: "result"; item: SearchItem }
  | { kind: "recent"; q: string }
  | { kind: "action"; action: QuickAction };

export function useGlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [active, setActive] = useState(0);
  const latest = useRef("");

  // ⌘K / Ctrl K anywhere, and the header's search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Recent searches and quick actions each time it opens.
  useEffect(() => {
    if (!open) return;
    recentSearchesAction().then(setRecents);
    quickActionsAction()
      .then(setActions)
      .catch(() => {});
  }, [open]);

  const q = query.trim();
  // Debounced search.
  useEffect(() => {
    latest.current = q;
    if (q.length < 2) return;
    const timer = setTimeout(() => {
      setLoading(true);
      searchAction(q).then((r) => {
        if (latest.current !== r.query) return;
        setResults(r);
        setLoading(false);
        setActive(0);
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q]);

  const searching = q.length >= 2;
  const shown = searching && results?.query === q ? results.items : [];
  const counts = Object.fromEntries(
    SCOPES.map((s) => [s, s === "all" ? shown.length : shown.filter((i) => i.scope === s).length]),
  ) as Record<SearchScope, number>;
  // All: up to three per group, in the design's order (People, Homes, Schedule, Messages, Tasks).
  const inScope =
    scope === "all"
      ? GROUP_ORDER.flatMap((g) => shown.filter((i) => i.scope === g).slice(0, PER_GROUP))
      : shown.filter((i) => i.scope === scope);

  const rows: SearchRow[] = searching
    ? inScope.map((item) => ({ kind: "result", item }))
    : [
        ...recents.map((r): SearchRow => ({ kind: "recent", q: r })),
        ...actions.map((a): SearchRow => ({ kind: "action", action: a })),
      ];

  const close = () => {
    setOpen(false);
    setQuery("");
    setScope("all");
    setResults(null);
    setActive(0);
  };

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const choose = (row: SearchRow | undefined) => {
    if (!row) return;
    if (row.kind === "recent") {
      setQuery(row.q);
      return;
    }
    if (row.kind === "action") return go(row.action.href);
    saveRecentSearchAction(q);
    go(row.item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = rows.length;
      if (n) setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(rows[active]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const i = SCOPES.indexOf(scope);
      setScope(SCOPES[(i + (e.shiftKey ? -1 : 1) + SCOPES.length) % SCOPES.length]);
      setActive(0);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return {
    open,
    setOpen: (value: boolean) => (value ? setOpen(true) : close()),
    query,
    setQuery: (value: string) => {
      setQuery(value);
      setActive(0);
    },
    scope,
    setScope: (s: SearchScope) => {
      setScope(s);
      setActive(0);
    },
    searching,
    loading: searching && (loading || results?.query !== q),
    error: searching ? results?.error : undefined,
    counts: searching && results?.query === q ? counts : undefined,
    rows,
    recents,
    actions,
    active,
    setActive,
    choose,
    onKeyDown,
    clearRecents: () => {
      setRecents([]);
      clearRecentSearchesAction();
    },
    go,
  };
}
