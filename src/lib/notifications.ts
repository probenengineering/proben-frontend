import "server-only";

import { redirect } from "next/navigation";

import { ApiError, errorMessage, request, type RequestOptions } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";
import { requestTime } from "@/lib/command-center/api";
import type { AppNotification, NotificationKind } from "@/types/notification";

// Notifications service (GET /api/notifications/inbox, docs/command-center.md §5). Server-only:
// the page loads through getNotifications(), the read actions live in notifications-actions.ts.

const KINDS: NotificationKind[] = [
  "homes",
  "messages",
  "announcements",
  "schedule",
  "tasks",
  "attendance",
  "hr_documents",
];

interface ApiInboxItem {
  id: string;
  category: string;
  feedCategory?: NotificationKind;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  /** The record it's about. `type` values aren't documented yet, so links use the ids. */
  destination?: {
    type: string;
    id: string;
    homeId: string | null;
    conversationId: string | null;
  } | null;
}

interface ApiInboxPage {
  items: ApiInboxItem[];
  nextCursor: string | null;
  serverTime?: string;
}

export interface NotificationFeed {
  notifications: AppNotification[];
  /** Set when the inbox couldn't load; the page shows it instead of the list. */
  error?: string;
}

export async function notificationsApi<T>(
  path: string,
  options: Omit<RequestOptions, "accessToken"> = {},
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new ApiError(401, "UNAUTHENTICATED", "Your session has ended. Sign in again.");
  }
  return request<T>(`/api/notifications${path}`, { ...options, accessToken });
}

/** The newest 100 notifications (one page; paging isn't in Figma). Not signed in → empty. */
export async function getNotifications(): Promise<NotificationFeed> {
  if (!(await getAccessToken())) return { notifications: [] };
  try {
    const page = await notificationsApi<ApiInboxPage>("/inbox?limit=100");
    const now = page.serverTime ? Date.parse(page.serverTime) : await requestTime();
    return { notifications: page.items.map((item) => toNotification(item, now)) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/sign-in");
    return { notifications: [], error: errorMessage(error) };
  }
}

function toNotification(item: ApiInboxItem, now: number): AppNotification {
  const category = item.feedCategory ?? item.category;
  return {
    id: item.id,
    kind: KINDS.includes(category as NotificationKind)
      ? (category as NotificationKind)
      : "announcements",
    title: item.title,
    message: item.body,
    time: relativeTime(item.createdAt, now),
    read: Boolean(item.readAt),
    href: hrefOf(item.destination, category),
  };
}

/** A chat opens that conversation, a home opens its profile; else the kind's default page. */
function hrefOf(d: ApiInboxItem["destination"], category: string) {
  if (d?.conversationId) return `/messages/${encodeURIComponent(d.conversationId)}`;
  if (category === "homes" && d?.homeId) return `/homes?home=${encodeURIComponent(d.homeId)}`;
  return undefined;
}

/** "Just now", "10 min ago", "3 hr ago", "Yesterday", "4 days ago", then "Nov 5, 2026". */
function relativeTime(iso: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
