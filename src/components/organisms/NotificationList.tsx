"use client";

import { useState } from "react";

import { Chip } from "@/components/atoms";
import { EmptyNotice, NotificationItem } from "@/components/molecules";
import type { AppNotification } from "@/types/notification";

// Notifications page body (Figma 51:11583 empty, 51:11625 all, 51:12383 unread, 51:12260 one
// expanded): All / Unread chips and "Mark all as read", then the list in a white 16px card.
// Read state only changes locally until the API exists (docs/command-center.md §5).
export interface NotificationListProps {
  notifications: AppNotification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const shown = filter === "unread" ? items.filter((item) => !item.read) : items;
  const hasUnread = items.some((item) => !item.read);
  const markRead = (id?: string) =>
    setItems((list) =>
      list.map((item) => (!id || item.id === id ? { ...item, read: true } : item)),
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Chip selected={filter === "all"} onClick={() => setFilter("all")}>
            All
          </Chip>
          <Chip selected={filter === "unread"} onClick={() => setFilter("unread")}>
            Unread
          </Chip>
        </div>
        <button
          type="button"
          onClick={() => markRead()}
          disabled={!hasUnread}
          className="type-paragraph-sm font-semibold whitespace-nowrap text-black-50 enabled:hover:text-black disabled:cursor-default"
        >
          Mark all as read
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <EmptyNotice
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description="You have no notifications right now. New updates will appear here."
          />
        </div>
      ) : (
        <ul className="w-full overflow-clip rounded-[16px] bg-white">
          {shown.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
              onMarkRead={() => markRead(item.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
