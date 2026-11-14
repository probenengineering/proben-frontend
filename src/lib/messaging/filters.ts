import type { ApiConversation, ConversationQuery, ConversationType } from "./types";

// Inbox search, filters and ordering, kept in the page URL (?q=&type=&unread=1…) so the header
// menus and the chat list (rendered on the server) agree, and a filtered inbox can be shared.
// Only values that differ from the defaults are written to the URL.
// The API does the filtering (toApiQuery, see inbox-filters.md); the ordering options it doesn't
// have (oldest first, unread first) are done here (orderChats).

export interface InboxFilters {
  /** Matches chat titles and message text. */
  q: string;
  /** Empty means every type. */
  types: ConversationType[];
  unreadOnly: boolean;
  /** Has a priority message, read or not. */
  priorityOnly: boolean;
  mentionsOnly: boolean;
  attachmentsOnly: boolean;
  /** Another person in the chat is in this team / home / has this role. Empty means all. */
  teamId: string;
  homeId: string;
  roleId: string;
  /** Priority: chats with unread priority messages first, then newest. */
  order: "Newest" | "Oldest" | "Priority";
  unreadFirst: boolean;
  priorityFirst: boolean;
}

export const DEFAULT_FILTERS: InboxFilters = {
  q: "",
  types: [],
  unreadOnly: false,
  priorityOnly: false,
  mentionsOnly: false,
  attachmentsOnly: false,
  teamId: "",
  homeId: "",
  roleId: "",
  order: "Newest",
  unreadFirst: true,
  priorityFirst: true,
};

const TYPES: ConversationType[] = ["direct", "group", "announcement"];
// The API rejects malformed IDs with a 400, so anything else in the URL is ignored.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const id = (value: string | string[] | undefined) => {
  const v = one(value) ?? "";
  return UUID.test(v) ? v : "";
};

export function parseFilters(params: Params): InboxFilters {
  const types = (one(params.type) ?? "")
    .split(",")
    .filter((t): t is ConversationType => TYPES.includes(t as ConversationType));
  return {
    q: (one(params.q) ?? "").slice(0, 100),
    types: [...new Set(types)],
    unreadOnly: one(params.unread) === "1",
    priorityOnly: one(params.priority) === "1",
    mentionsOnly: one(params.mentions) === "1",
    attachmentsOnly: one(params.attachments) === "1",
    teamId: id(params.team),
    homeId: id(params.home),
    roleId: id(params.role),
    order:
      one(params.order) === "oldest"
        ? "Oldest"
        : one(params.order) === "priority"
          ? "Priority"
          : "Newest",
    unreadFirst: one(params.unreadFirst) !== "0",
    priorityFirst: one(params.priorityFirst) !== "0",
  };
}

export function filtersToSearch(filters: InboxFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.types.length) params.set("type", filters.types.join(","));
  if (filters.unreadOnly) params.set("unread", "1");
  if (filters.priorityOnly) params.set("priority", "1");
  if (filters.mentionsOnly) params.set("mentions", "1");
  if (filters.attachmentsOnly) params.set("attachments", "1");
  if (filters.teamId) params.set("team", filters.teamId);
  if (filters.homeId) params.set("home", filters.homeId);
  if (filters.roleId) params.set("role", filters.roleId);
  if (filters.order !== "Newest") params.set("order", filters.order.toLowerCase());
  if (!filters.unreadFirst) params.set("unreadFirst", "0");
  if (!filters.priorityFirst) params.set("priorityFirst", "0");
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** The filters as GET /conversations parameters; empty when nothing narrows the list. */
export function toApiQuery(f: InboxFilters): ConversationQuery {
  const query: ConversationQuery = {};
  if (f.q) query.q = f.q;
  // All three types is the same as none (the API also rejects an empty list).
  if (f.types.length > 0 && f.types.length < TYPES.length) query.types = f.types;
  if (f.unreadOnly) query.unreadOnly = true;
  if (f.priorityOnly) query.priorityOnly = true;
  if (f.mentionsOnly) query.mentionsMe = true;
  if (f.attachmentsOnly) query.hasAttachments = true;
  if (f.teamId) query.teamId = f.teamId;
  if (f.homeId) query.homeId = f.homeId;
  if (f.roleId) query.roleId = f.roleId;
  return query;
}

export const isFiltered = (f: InboxFilters) => Object.keys(toApiQuery(f)).length > 0;

const time = (c: ApiConversation) => Date.parse(c.lastMessageAt ?? c.updatedAt ?? "") || 0;
const unread = (c: ApiConversation) => c.unreadCount > 0 || !!c.markedUnread;

/** Orders the chats the API returned (pinned chats get their own section later). */
export function orderChats(conversations: ApiConversation[], f: InboxFilters) {
  return [...conversations].sort((a, b) => {
    const byPriority = f.priorityFirst || f.order === "Priority";
    if (byPriority && !!a.hasUnreadPriority !== !!b.hasUnreadPriority) {
      return a.hasUnreadPriority ? -1 : 1;
    }
    if (f.unreadFirst && unread(a) !== unread(b)) return unread(a) ? -1 : 1;
    return f.order === "Oldest" ? time(a) - time(b) : time(b) - time(a);
  });
}
