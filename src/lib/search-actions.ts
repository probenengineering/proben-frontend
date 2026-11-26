"use server";

import { errorMessage } from "@/lib/auth/api";
import {
  commandCenter,
  getTimezone,
  getTodayOverview,
  listOpenShifts,
  listTasks,
  requestTime,
} from "@/lib/command-center/api";
import { addDays, dayKey, formatDay, formatTime, startOfDay } from "@/lib/command-center/time";
import type { ApiHome } from "@/lib/command-center/types";
import type { QuickAction, SearchItem, SearchResults } from "@/types/search";

// Global search (Figma 60:14989 – 60:15643). GET /search?q= (2+ characters) returns tasks, events,
// homes, people, conversations and messages; each becomes a result row with where it opens.
// Recent searches: GET/POST/DELETE /search/recents. Quick actions read today's overview, tasks
// and open shifts for their counts.

// Search returns slim items, not the full task / event / conversation / message objects.
interface SearchResponse {
  tasks?: { id: string; title: string; status: string; dueAt: string | null }[];
  events?: { id: string; title: string; startsAt: string }[];
  homes?: { items?: ApiHome[] };
  people?: { data?: { items?: Person[] } };
  conversations?: { data?: { items?: { id: string; type: string; name?: string | null }[] } };
  messages?: {
    data?: {
      items?: { id: string; conversationId: string; body?: string | null; sentAt?: string }[];
    };
  };
}

const CONVERSATION_KIND: Record<string, string> = {
  direct: "Direct message",
  group: "Group",
  announcement: "Announcement",
};
/** Tasks past their due time count as overdue unless they're finished or waiting for review. */
const NOT_OVERDUE = new Set(["submitted", "completed", "cancelled"]);

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
    const [data, tz, now] = await Promise.all([
      commandCenter<SearchResponse>(`/search?q=${encodeURIComponent(q)}`),
      getTimezone(),
      requestTime(),
    ]);
    const conversations = data.conversations?.data?.items ?? [];
    const messages = data.messages?.data?.items ?? [];
    // Messages carry no sender, so they're titled by the chat they're in when it's also a result.
    const chatNames = new Map(conversations.map((c) => [c.id, c.name]));
    const items: SearchItem[] = [];

    for (const c of conversations) {
      const kind = CONVERSATION_KIND[c.type] ?? "Conversation";
      const title = c.name || kind;
      items.push({
        id: `conversation-${c.id}`,
        scope: "people",
        title,
        detail: c.name ? kind : undefined,
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
        detail: `${formatDay(day, { weekday: "short", day: "numeric", month: "short" })} · ${formatTime(e.startsAt, tz)}`,
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
        meta:
          t.dueAt && Date.parse(t.dueAt) < now && !NOT_OVERDUE.has(t.status)
            ? "Overdue"
            : undefined,
        href: "/tasks/list",
        icon: "tasks",
        tone: "amber",
      });
    }
    for (const m of messages) {
      items.push({
        id: `message-${m.id}`,
        scope: "messages",
        title: chatNames.get(m.conversationId) || "Message",
        detail: m.body ? `“${m.body.slice(0, 120)}”` : undefined,
        meta: ago(m.sentAt, now, tz),
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
