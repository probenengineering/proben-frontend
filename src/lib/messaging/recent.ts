import "server-only";

import { getCurrentUser } from "@/lib/auth/user";

import { listConversations, lookupNames } from "./api";
import type { ChatTarget } from "./inbox";
import { avatarFor } from "./mappers";
import type { ApiConversation } from "./types";

/**
 * The people in your most recent chats (newest message first, no repeats), e.g. for the dashboard's
 * Messages dock. Empty when signed out or when chats can't be loaded; never redirects.
 */
export async function loadRecentContacts(limit = 3): Promise<ChatTarget[]> {
  const me = await getCurrentUser();
  if (!me) return [];
  const conversations = await listConversations().catch(() => [] as ApiConversation[]);
  const latest = (c: ApiConversation) => Date.parse(c.lastMessageAt ?? c.updatedAt ?? "") || 0;
  const recent = conversations.filter((c) => c.lastMessage).sort((a, b) => latest(b) - latest(a));
  const people: string[] = [];
  for (const c of recent) {
    for (const id of c.participants) {
      if (id !== me.id && !people.includes(id)) people.push(id);
    }
    if (people.length >= limit) break;
  }
  const chosen = people.slice(0, limit);
  const names = await lookupNames(chosen);
  return chosen.map((id) => {
    const name = names[id] ?? "Unknown";
    return { id, name, avatar: avatarFor(id, name) };
  });
}
