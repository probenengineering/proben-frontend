"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { FilterOption } from "@/components/molecules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { useInboxFilters } from "@/hooks/useInboxFilters";
import type { InboxFilters } from "@/lib/messaging/filters";
import type { ConversationType, FilterCatalog } from "@/lib/messaging/types";

import { PeopleFilter } from "./PeopleFilter";

// Figma "Chat filters": the sliders icon in the Inbox header opens this 284px menu.
// Every option filters the chat list (kept in the URL, done by the API: see lib/messaging/filters);
// "Add filter…" narrows the options shown.

const TYPE_OPTIONS: { type: ConversationType; icon: IconName; label: string }[] = [
  { type: "direct", icon: "user-16", label: "Direct Messages" },
  { type: "group", icon: "profile-2user-16", label: "Groups" },
  { type: "announcement", icon: "volume-high", label: "Announcement" },
];

function SectionTitle({ children }: { children: string }) {
  return <h3 className="type-paragraph-sm font-medium text-black">{children}</h3>;
}

export interface ChatFilterMenuProps {
  /** The inbox's current filters (from the page URL). */
  filters?: InboxFilters;
  /** Teams, homes and roles to offer; null/absent without directory permission or while loading. */
  catalog?: FilterCatalog | null;
}

export function ChatFilterMenu({ filters: current, catalog = null }: ChatFilterMenuProps) {
  const { filters, update } = useInboxFilters(current);
  const [search, setSearch] = useState("");
  const shows = (label: string) => label.toLowerCase().includes(search.trim().toLowerCase());
  const toggleType = (type: ConversationType, on: boolean) =>
    update({
      types: on ? [...filters.types, type] : filters.types.filter((t) => t !== type),
    });

  const status = [
    {
      icon: "message-notif" as const,
      label: "Unread only",
      checked: filters.unreadOnly,
      onChange: (unreadOnly: boolean) => update({ unreadOnly }),
    },
    {
      icon: "grid-16" as const,
      label: "Mentions",
      checked: filters.mentionsOnly,
      onChange: (mentionsOnly: boolean) => update({ mentionsOnly }),
    },
    {
      icon: "info-circle" as const,
      label: "Priority",
      checked: filters.priorityOnly,
      onChange: (priorityOnly: boolean) => update({ priorityOnly }),
    },
    {
      icon: "attach-square-outline" as const,
      label: "With attachments",
      checked: filters.attachmentsOnly,
      onChange: (attachmentsOnly: boolean) => update({ attachmentsOnly }),
    },
  ].filter((option) => shows(option.label));
  const types = TYPE_OPTIONS.filter((option) => shows(option.label));

  return (
    <Popover>
      <PopoverTrigger aria-label="Filters">
        <Icon name="setting-4" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        // Figma: menu starts 32px left of the icon and 8px below it.
        alignOffset={-32}
        sideOffset={8}
        className="w-71 gap-0 overflow-clip rounded-[24px] border border-hairline bg-white p-0 shadow-[0_4px_10px_0_rgba(230,230,230,0.25)] ring-0"
      >
        <div className="flex items-center justify-between border-b border-white-400 px-5 py-3.5">
          <input
            aria-label="Add filter"
            placeholder="Add filter..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent type-title-sm font-medium text-black outline-none placeholder:text-black"
          />
          <Icon name="kbd-f" />
        </div>

        {types.length > 0 && (
          <section className="flex flex-col gap-4 px-5 py-3">
            <SectionTitle>Conversation Type</SectionTitle>
            <div className="flex flex-col">
              {types.map((option) => (
                <FilterOption
                  key={option.type}
                  icon={option.icon}
                  label={option.label}
                  checked={filters.types.includes(option.type)}
                  onCheckedChange={(on) => toggleType(option.type, on)}
                />
              ))}
            </div>
          </section>
        )}

        {status.length > 0 && (
          <section className="flex flex-col gap-4 px-5 py-3">
            <SectionTitle>Status</SectionTitle>
            <div className="flex flex-col">
              {status.map((option) => (
                <FilterOption
                  key={option.label}
                  icon={option.icon}
                  label={option.label}
                  checked={option.checked}
                  onCheckedChange={option.onChange}
                />
              ))}
            </div>
          </section>
        )}

        {shows("People and Teams") && (
          <section className="flex flex-col gap-4 px-5 pt-3 pb-6">
            <SectionTitle>People and Teams</SectionTitle>
            <PeopleFilter filters={filters} catalog={catalog} update={update} />
          </section>
        )}
      </PopoverContent>
    </Popover>
  );
}
