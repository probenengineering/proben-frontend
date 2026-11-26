"use client";

import { useState } from "react";

import { Chip } from "@/components/atoms";
import { EmptyNotice, NotificationItem } from "@/components/molecules";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications-actions";
import { showToast } from "@/lib/toast";
import type { AppNotification } from "@/types/notification";

// Notifications page body (Figma 51:11583 empty, 51:11625 all, 51:12383 unread, 51:12260 one
// expanded): All / Unread chips and "Mark all as read", then the list in a white 16px card.
// Marking read is optimistic; a failed call puts the rows back and shows a toast.
export interface NotificationListProps {
  notifications: AppNotification[];
  /** The inbox failed to load; shown in place of the empty state. */
  error?: string;
}

export function NotificationList({ notifications, error }: NotificationListProps) {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const shown = filter === "unread" ? items.filter((item) => !item.read) : items;
  const hasUnread = items.some((item) => !item.read);
  const setRead = (ids: Set<string>, read: boolean) =>
    setItems((list) => list.map((item) => (ids.has(item.id) ? { ...item, read } : item)));
  const markRead = async (id?: string) => {
    const unread = items.filter((item) => !item.read && (!id || item.id === id));
    if (unread.length === 0) return;
    const ids = new Set(unread.map((item) => item.id));
    setRead(ids, true);
    const result = await (id ? markNotificationRead(id) : markAllNotificationsRead());
    if (!result.ok) {
      setRead(ids, false);
      showToast("error", result.error);
    }
  };

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
            title={
              error
                ? "Couldn't load notifications"
                : filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"
            }
            description={
              error ?? "You have no notifications right now. New updates will appear here."
            }
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
