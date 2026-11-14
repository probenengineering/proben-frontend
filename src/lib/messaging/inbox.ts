import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { type CurrentUser, getCurrentUser } from "@/lib/auth/user";
import type { ChatAvatar } from "@/lib/chat-types";

import {
  getConversation,
  getFilterCatalog,
  getMessages,
  getSettings,
  listConversations,
  lookupNames,
} from "./api";
import {
  DEFAULT_FILTERS,
  filtersToSearch,
  type InboxFilters,
  isFiltered,
  orderChats,
  toApiQuery,
} from "./filters";
import { avatarFor, conversationTitle, type InboxSections, toInboxSections } from "./mappers";
import type {
  ApiConversation,
  FilterCatalog,
  MessagePage,
  MessagingSettings,
  NameMap,
} from "./types";

// Loads what the /messages pages show. Signed out → /sign-in. Unknown chat → 404.

export interface ChatTarget {
  id: string;
  name: string;
  avatar: ChatAvatar;
}

export interface Inbox extends InboxSections {
  me: CurrentUser;
  /** Every chat, for "Forward to". */
  targets: ChatTarget[];
  names: NameMap;
  /** The search, filters and ordering applied to the chat list. */
  filters: InboxFilters;
  /** Teams, homes and roles to filter by; null without directory permission. */
  catalog: FilterCatalog | null;
  /** Why no chats show, e.g. messaging isn't enabled for this account, or nothing matches. */
  error?: string;
}

const EMPTY: InboxSections = { sections: [], groupSections: [], announcementSections: [] };

async function requireUser() {
  const me = await getCurrentUser();
  if (!me) redirect("/sign-in");
  return me;
}

export async function loadInbox(filters: InboxFilters = DEFAULT_FILTERS): Promise<Inbox> {
  const me = await requireUser();
  let conversations: ApiConversation[];
  let shown: ApiConversation[];
  // Without directory permission there's no catalog; the team/home/role lists say so.
  const catalog = getFilterCatalog().catch(() => null);
  try {
    // Every chat (for "Forward to"), plus the filtered ones when filters are on. The API filters;
    // the order is set here.
    const [all, matching] = await Promise.all([
      listConversations(),
      isFiltered(filters) ? listConversations(toApiQuery(filters)) : null,
    ]);
    conversations = all;
    shown = orderChats(matching ?? all, filters);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/sign-in");
    const base = { me, ...EMPTY, targets: [], names: {}, filters, catalog: await catalog };
    return { ...base, error: errorMessage(error) };
  }
  const ids = [...conversations, ...shown].flatMap((c) => [
    ...c.participants,
    c.lastMessage?.senderId ?? "",
  ]);
  const names = { ...(await lookupNames(ids)), [me.id]: me.name };
  const targets = conversations
    .filter((c) => c.type !== "announcement")
    .map((c) => {
      const name = conversationTitle(c, names, me.id);
      return { id: c.id, name, avatar: avatarFor(c.id, name) };
    });
  const nothingMatches = isFiltered(filters) && shown.length === 0;
  // Opening a chat keeps the list filtered: each row's link carries the current filters.
  const search = filtersToSearch(filters);
  const sections = toInboxSections(shown, names, me.id);
  for (const list of Object.values(sections)) {
    for (const section of list) {
      for (const chat of section.chats) if (chat.href) chat.href += search;
    }
  }
  return {
    me,
    ...sections,
    targets,
    names,
    filters,
    catalog: await catalog,
    error: nothingMatches ? "No chats match your search or filters" : undefined,
  };
}

export interface ChatScreen extends Inbox {
  conversation: ApiConversation;
  title: string;
  page: MessagePage;
  settings: MessagingSettings | null;
}

/** Once per request (the page and its metadata both ask). */
export const loadChat = cache(async function loadChat(
  conversationId: string,
  filters: InboxFilters = DEFAULT_FILTERS,
): Promise<ChatScreen> {
  const inbox = await loadInbox(filters);
  let conversation: ApiConversation;
  let page: MessagePage;
  try {
    [conversation, page] = await Promise.all([
      getConversation(conversationId),
      getMessages(conversationId),
    ]);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
  const settings = await getSettings().catch(() => null);
  const senders = page.items.map((m) => m.senderId ?? "").filter((id) => id && !inbox.names[id]);
  const names = { ...inbox.names, ...(await lookupNames(senders)) };
  return {
    ...inbox,
    names,
    conversation,
    title: conversationTitle(conversation, names, inbox.me.id),
    page,
    settings,
  };
});
