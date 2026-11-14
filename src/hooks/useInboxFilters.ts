"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { DEFAULT_FILTERS, filtersToSearch, type InboxFilters } from "@/lib/messaging/filters";

// The inbox search, filters and ordering live in the URL; changing one replaces the URL (no new
// history entry) and the server re-renders the chat list. `filters` comes from the page.
// The path is read when a filter changes (not with usePathname), so the header can also render in
// the page's static shell.
export function useInboxFilters(filters: InboxFilters = DEFAULT_FILTERS) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (change: Partial<InboxFilters>) =>
    startTransition(() =>
      router.replace(`${window.location.pathname}${filtersToSearch({ ...filters, ...change })}`, {
        scroll: false,
      }),
    );

  return { filters, update, reset: () => update(DEFAULT_FILTERS), pending };
}
