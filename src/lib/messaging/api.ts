import "server-only";

import { ApiError, request, type RequestOptions } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";

import type {
  ApiConversation,
  ConversationPage,
  ConversationQuery,
  FilterCatalog,
  MessagePage,
  MessagingSettings,
  NameMap,
} from "./types";

// Messaging API calls with the signed-in person's token (Proben-Chat-Guide.md). Server-side only.

export async function messaging<T>(
  path: string,
  options: Omit<RequestOptions, "accessToken"> = {},
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new ApiError(401, "UNAUTHENTICATED", "Your session has ended. Sign in again.");
  }
  return request<T>(`/api/messaging${path}`, { ...options, accessToken });
}

/**
 * All conversations matching the filters (search covers chat titles and message text),
 * following pages until done. Arrays go as one comma list, e.g. types=direct,group.
 */
export async function listConversations(filter: ConversationQuery = {}) {
  const items: ApiConversation[] = [];
  for (let offset = 0; ; offset += 100) {
    const query = new URLSearchParams({ limit: "100", offset: String(offset) });
    for (const [key, value] of Object.entries(filter)) {
      if (Array.isArray(value) ? value.length : value) query.set(key, String(value));
    }
    const page = await messaging<ConversationPage>(`/conversations?${query}`);
    items.push(...page.items);
    if (!page.hasMore || page.items.length === 0) return items;
  }
}

export function getConversation(id: string) {
  return messaging<ApiConversation>(`/conversations/${encodeURIComponent(id)}`);
}

/** Latest messages, or older (beforeSeq) / newer (afterSeq) ones. Fetching records delivery. */
export function getMessages(id: string, cursor: { beforeSeq?: number; afterSeq?: number } = {}) {
  const query = new URLSearchParams({ limit: cursor.afterSeq !== undefined ? "100" : "50" });
  if (cursor.beforeSeq !== undefined) query.set("beforeSeq", String(cursor.beforeSeq));
  if (cursor.afterSeq !== undefined) query.set("afterSeq", String(cursor.afterSeq));
  return messaging<MessagePage>(`/conversations/${encodeURIComponent(id)}/messages?${query}`);
}

/** Homes, teams and roles to filter the inbox by. Needs directory permission. */
export function getFilterCatalog() {
  return messaging<FilterCatalog>("/conversations/filters");
}

export function getSettings() {
  return messaging<MessagingSettings>("/settings");
}

// POST /directory/lookup's request and response aren't documented yet (IdsDto is empty).
// Assumed { ids } in, and a list (or { items }) of people with id + displayName out.
interface DirectoryPerson {
  id?: string;
  staffId?: string;
  displayName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

/** Names for staff IDs, including former colleagues. Unknown or failed lookups are left out. */
export async function lookupNames(ids: string[]): Promise<NameMap> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const accessToken = await getAccessToken();
  try {
    const result = await request<DirectoryPerson[] | { items?: DirectoryPerson[] }>(
      "/api/identity/directory/lookup",
      { body: { ids: unique }, accessToken },
    );
    const people = Array.isArray(result) ? result : (result.items ?? []);
    const names: NameMap = {};
    for (const person of people) {
      const id = person.id ?? person.staffId;
      const name =
        person.displayName ||
        person.name ||
        [person.firstName, person.lastName].filter(Boolean).join(" ");
      if (id && name) names[id] = name;
    }
    return names;
  } catch {
    return {};
  }
}
