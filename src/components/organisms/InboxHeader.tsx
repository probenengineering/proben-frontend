import Link from "next/link";

import { Icon } from "@/components/atoms";
import type { InboxFilters } from "@/lib/messaging/filters";
import type { FilterCatalog } from "@/lib/messaging/types";

import { ChatFilterMenu } from "./ChatFilterMenu";
import { ChatViewMenu } from "./ChatViewMenu";
import { CurrentUserBadge } from "./CurrentUserBadge";
import { InboxSearch } from "./InboxSearch";
import { MobileNav } from "./MobileNav";

// Figma: Inbox title bar (87px, white-400 bottom border).
// Desktop (lg+): left zone lines up with the 384px chat list (title, inbox/sort/filter icons);
// right zone has search 668px from the card's left edge, a short divider, role tag and avatar.
// Below lg (agreed, not in Figma): ☰ + title + icons on one row, full-width search underneath;
// role tag and avatar are reached through the drawer.
// The inbox icon goes back to the whole inbox (clears search and filters); search, display options
// and filters change the chat list (see useInboxFilters).
export interface InboxHeaderProps {
  /** The inbox's current search, filters and ordering (from the page URL). */
  filters?: InboxFilters;
  /** Teams, homes and roles for the filter menu. */
  catalog?: FilterCatalog | null;
}

export function InboxHeader({ filters, catalog }: InboxHeaderProps) {
  return (
    <header className="flex w-full shrink-0 flex-col border-b border-white-400 lg:h-21.75 lg:flex-row lg:items-center">
      <div className="flex h-16 w-full shrink-0 items-center justify-between px-5 lg:h-auto lg:w-96 lg:pr-4 lg:pl-10">
        <div className="flex items-center gap-3">
          <MobileNav className="md:hidden" />
          <h1 className="type-title-lg font-medium text-black">Inbox</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/messages" aria-label="All chats" title="All chats">
            <Icon name="direct-inbox" />
          </Link>
          <ChatViewMenu filters={filters} />
          <ChatFilterMenu filters={filters} catalog={catalog} />
        </div>
      </div>

      <div className="px-5 pb-4 lg:hidden">
        <InboxSearch filters={filters} className="w-full" />
      </div>

      <div className="hidden flex-1 items-center pr-10 lg:flex">
        {/* 384px list zone + 284px = 668px, as in Figma. */}
        <InboxSearch filters={filters} className="ml-71" />
        <div className="ml-auto flex items-center gap-5">
          <span className="h-3 w-0.5 bg-white-700" />
          <CurrentUserBadge />
        </div>
      </div>
    </header>
  );
}
