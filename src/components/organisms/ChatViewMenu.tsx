"use client";

import { Icon } from "@/components/atoms";
import { SelectDropdown, SettingToggleRow } from "@/components/molecules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { useInboxFilters } from "@/hooks/useInboxFilters";
import type { InboxFilters } from "@/lib/messaging/filters";

// Figma "Chat filters" display options: the sort icon in the Inbox header opens this 334px menu.
// Priority inbox (chats with unread priority messages first), unread first and ordering reorder the
// chat list. "Show snoozed" and "Group unreads by" have nothing behind them in the API yet.
// Labels: Figma "Inter Display" Medium, built with Inter Medium (agreed).
const labelClass = "type-paragraph-sm font-medium whitespace-nowrap text-grey-700";

export interface ChatViewMenuProps {
  /** The inbox's current filters (from the page URL). */
  filters?: InboxFilters;
}

export function ChatViewMenu({ filters: current }: ChatViewMenuProps) {
  const { filters, update } = useInboxFilters(current);
  return (
    <Popover>
      <PopoverTrigger aria-label="Sort and display options">
        <Icon name="sort" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        // Figma: menu starts 25px right of the sort icon and 8px below it. Base UI caps the offset
        // at the icon's 20px width, so the last 5px is a translate.
        alignOffset={20}
        sideOffset={8}
        className="w-83.5 translate-x-1.25 gap-0 overflow-clip rounded-[24px] border border-hairline bg-white p-0 shadow-[0_4px_10px_0_rgba(230,230,230,0.25)] ring-0"
      >
        <SettingToggleRow
          label="Enable Priority inbox"
          checked={filters.priorityFirst}
          onCheckedChange={(priorityFirst) => update({ priorityFirst })}
        />
        <SettingToggleRow label="Show snoozed" defaultChecked disabled />
        <SettingToggleRow
          label="Show unread first"
          checked={filters.unreadFirst}
          onCheckedChange={(unreadFirst) => update({ unreadFirst })}
        />

        <div className="flex flex-col gap-2 px-5 pt-3 pb-6">
          {/* As Figma: label, 8px gap, button fills the rest. Our Inter label is ~9px wider than
              Figma's Inter Display, so this button comes out ~9px narrower. */}
          <div className="flex items-center gap-2">
            <span className={labelClass}>Group unreads by</span>
            <SelectDropdown
              aria-label="Group unreads by"
              options={["No grouping", "Focus"]}
              defaultValue="No grouping"
              className="min-w-0 flex-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Ordering</span>
            <SelectDropdown
              aria-label="Ordering"
              options={["Newest", "Oldest", "Priority"]}
              defaultValue={filters.order}
              onChange={(order) => update({ order: order as InboxFilters["order"] })}
              compact
              showCheck
              className="w-43"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
