"use server";

import { errorMessage } from "@/lib/auth/api";
import { getCurrentUser } from "@/lib/auth/user";
import {
  commandCenter,
  getTimezone,
  getTodayOverview,
  listOpenShifts,
  listTasks,
  requestTime,
} from "@/lib/command-center/api";
import { addDays, dayKey, formatDay, formatTime, startOfDay } from "@/lib/command-center/time";
import type { ApiEvent, ApiHome, ApiTask } from "@/lib/command-center/types";
import { lookupNames } from "@/lib/messaging/api";
import { conversationTitle } from "@/lib/messaging/mappers";
import type { ApiConversation, ApiMessage } from "@/lib/messaging/types";
import type { QuickAction, SearchItem, SearchResults } from "@/types/search";

// Global search (Figma 60:14989 – 60:15643). GET /search?q= (2+ characters) returns tasks, events,
// homes, people, conversations and messages; each becomes a result row with where it opens.
// Recent searches: GET/POST/DELETE /search/recents. Quick actions read today's overview, tasks
// and open shifts for their counts.

interface SearchResponse {
  tasks?: ApiTask[];
  events?: ApiEvent[];
  homes?: { items?: ApiHome[] };
  people?: { data?: { items?: Person[] } };
  conversations?: { data?: { items?: ApiConversation[] } };
  messages?: { data?: { items?: ApiMessage[] } };
}

interface Person {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string | null;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

function ago(iso: string | null | undefined, now: number, tz: string) {
  if (!iso) return undefined;
  const minutes = Math.floor((now - Date.parse(iso)) / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h`;
  const days = Math.floor(minutes / (24 * 60));
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return formatDay(dayKey(iso, tz), { month: "short", day: "numeric" });
}

export async function searchAction(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) return { query: q, items: [] };
  try {
    const [data, me, tz, now] = await Promise.all([
      commandCenter<SearchResponse>(`/search?q=${encodeURIComponent(q)}`),
      getCurrentUser(),
      getTimezone(),
      requestTime(),
    ]);
    const conversations = data.conversations?.data?.items ?? [];
    const messages = data.messages?.data?.items ?? [];
    const names = await lookupNames([
      ...conversations.flatMap((c) => c.participants),
      ...messages.flatMap((m) => (m.senderId ? [m.senderId] : [])),
    ]).catch(() => ({}) as Record<string, string>);
    const meId = me?.id ?? "";
    const items: SearchItem[] = [];

    for (const c of conversations) {
      const title = conversationTitle(c, names, meId);
      const kind =
        c.type === "direct" ? "Direct message" : c.type === "group" ? "Group" : "Announcement";
      items.push({
        id: `conversation-${c.id}`,
        scope: "people",
        title,
        detail: [kind, c.lastMessage?.preview && `“${c.lastMessage.preview}”`]
          .filter(Boolean)
          .join(" · "),
        meta: ago(c.lastMessageAt, now, tz),
        href: `/messages/${encodeURIComponent(c.id)}`,
        initials: initials(title),
        tone: c.type === "direct" ? "sky" : "purple",
      });
    }
    for (const p of data.people?.data?.items ?? []) {
      const name =
        p.displayName || [p.firstName, p.lastName].filter(Boolean).join(" ") || "Someone";
      items.push({
        id: `person-${p.id}`,
        scope: "people",
        title: name,
        detail: ["Person", p.jobTitle].filter(Boolean).join(" · "),
        href: "/messages",
        initials: initials(name),
        tone: "sky",
      });
    }
    for (const h of data.homes?.items ?? []) {
      const d = h.details ?? {};
      items.push({
        id: `home-${h.id}`,
        scope: "homes",
        title: h.name,
        detail: [d.address, d.city, [d.region, d.postalCode].filter(Boolean).join(" "), h.code]
          .filter(Boolean)
          .join(", "),
        meta: h.assignmentStatus === "upcoming" ? "Upcoming" : "Active",
        href: `/homes/${encodeURIComponent(h.id)}`,
        icon: "home",
        tone: "green",
      });
    }
    for (const e of data.events ?? []) {
      const day = dayKey(e.startsAt, tz);
      items.push({
        id: `event-${e.id}`,
        scope: "schedule",
        title: e.title,
        detail: `${formatDay(day, { weekday: "short", day: "numeric", month: "short" })} · ${formatTime(e.startsAt, tz)} – ${formatTime(e.endsAt, tz)}`,
        meta: "Event",
        href: `/schedule?view=day&date=${day}`,
        icon: "schedule",
        tone: "blue",
      });
    }
    for (const t of data.tasks ?? []) {
      items.push({
        id: `task-${t.id}`,
        scope: "tasks",
        title: t.title,
        detail: t.dueAt
          ? `Due ${formatDay(dayKey(t.dueAt, tz), { month: "short", day: "numeric" })}`
          : "Task",
        meta: t.isOverdue ? "Overdue" : undefined,
        href: `/tasks?task=${encodeURIComponent(t.id)}`,
        icon: "tasks",
        tone: "amber",
      });
    }
    for (const m of messages) {
      const sender = (m.senderId && names[m.senderId]) || "Message";
      items.push({
        id: `message-${m.id}`,
        scope: "messages",
        title: sender,
        detail: m.body ? `“${m.body.slice(0, 120)}”` : undefined,
        meta: ago(m.sentAt ?? m.createdAt, now, tz),
        href: `/messages/${encodeURIComponent(m.conversationId)}`,
        icon: "message",
        tone: "emerald",
      });
    }
    return { query: q, items };
  } catch (error) {
    return { query: q, items: [], error: errorMessage(error) };
  }
}

export async function recentSearchesAction(): Promise<string[]> {
  try {
    const list = await commandCenter<Record<string, unknown>[]>("/search/recents");
    return list
      .map((r) => String(r.q ?? r.query ?? r.text ?? ""))
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function saveRecentSearchAction(q: string) {
  if (q.trim().length < 2) return;
  await commandCenter("/search/recents", { method: "POST", body: { q: q.trim() } }).catch(() => {});
}

export async function clearRecentSearchesAction() {
  await commandCenter("/search/recents", { method: "DELETE" }).catch(() => {});
}

/** Quick actions before typing (Figma 60:15124), with live counts. */
export async function quickActionsAction(): Promise<QuickAction[]> {
  const actions: QuickAction[] = [];
  const [today, tasks, tz, now] = await Promise.all([
    getTodayOverview().catch(() => null),
    listTasks().catch(() => null),
    getTimezone(),
    requestTime(),
  ]);
  const shift = today?.overview.schedule.items.find((s) => s.status !== "cancelled");
  if (shift && today?.overview.attendance.status === "not_clocked_in") {
    actions.push({
      id: "clock-in",
      title: "Clock in",
      detail: `Start your ${formatTime(shift.startsAt, tz)} shift${shift.home?.name ? ` at ${shift.home.name}` : ""}`,
      href: "/",
      shortcut: "⌥ C",
    });
  }
  const attention = (tasks?.items ?? []).filter(
    (t) => t.isOverdue || t.status === "needs_attention",
  );
  const overdue = attention.filter((t) => t.isOverdue).length;
  actions.push({
    id: "tasks",
    title: "View tasks that need attention",
    detail: attention.length
      ? `${attention.length} ${attention.length === 1 ? "task" : "tasks"}${overdue ? ` · ${overdue} overdue` : ""}`
      : "Nothing needs your attention",
    href: "/tasks",
    shortcut: "⌥ T",
  });
  const day = dayKey(now, tz);
  const open = await listOpenShifts({
    from: startOfDay(day, tz),
    to: startOfDay(addDays(day, 7), tz),
  }).catch(() => null);
  const n = open?.items.length ?? 0;
  actions.push({
    id: "shifts",
    title: "Pick up an open shift",
    detail: n ? `${n} open ${n === 1 ? "shift" : "shifts"} this week` : "No open shifts this week",
    href: "/#open-shifts",
  });
  actions.push({
    id: "message",
    title: "New message",
    detail: "Start a conversation with a teammate",
    href: "/messages",
    shortcut: "⌥ N",
  });
  return actions;
}
