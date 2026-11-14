// Shapes returned by the messaging API (http://…/api/messaging/docs), only the fields we use.
// Shared by the server loaders, server actions and the client chat store.

export type ConversationType = "direct" | "group" | "announcement";

export interface ApiReaction {
  emoji: string;
  count: number;
  staffIds: string[];
}

export interface ApiAttachment {
  fileId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  /** Position in the conversation; null while not yet released (e.g. pending a malware scan). */
  seq: number | null;
  senderId: string | null;
  kind: "user" | "system";
  body: string | null;
  status: "pending_scan" | "sent" | "blocked";
  attachments?: ApiAttachment[];
  replyToMessageId?: string | null;
  forwarded?: boolean;
  reactions?: ApiReaction[];
  createdAt?: string;
  sentAt?: string | null;
  editedAt?: string | null;
  retracted?: boolean;
}

export interface MessagePage {
  items: ApiMessage[];
  hasMore: boolean;
  lastReadSeq: number;
}

export interface ApiConversation {
  id: string;
  type: ConversationType;
  name: string | null;
  participants: string[];
  memberCount: number;
  lastSeq: number;
  lastReadSeq: number;
  unreadCount: number;
  hasUnreadPriority?: boolean;
  /** Any visible priority message, read or not (the Priority filter). */
  hasPriority?: boolean;
  hasAttachments?: boolean;
  /** Someone mentioned you (read or not). */
  hasMentions?: boolean;
  hasUnreadMentions?: boolean;
  unreadMentionCount?: number;
  /** Unread mention or unread priority message. */
  focus?: boolean;
  snoozed?: boolean;
  snoozedUntil?: string | null;
  /** Personal "mark as unread" reminder. */
  markedUnread?: boolean;
  pinnedAt: string | null;
  muted: boolean;
  lastMessageAt: string | null;
  updatedAt: string | null;
  lastMessage: { id: string; seq: number; senderId: string; preview: string } | null;
}

/** GET /conversations filters (inbox-filters.md). They combine with AND, before pagination. */
export interface ConversationQuery {
  q?: string;
  /** Older clients' single type; don't send with `types`. */
  type?: ConversationType;
  types?: ConversationType[];
  unreadOnly?: boolean;
  priorityOnly?: boolean;
  mentionsMe?: boolean;
  hasAttachments?: boolean;
  /** Another participant belongs to this team / home / holds this role. */
  teamId?: string;
  homeId?: string;
  roleId?: string;
}

/** GET /conversations/filters: the homes, teams and roles you can filter by. */
export interface FilterCatalog {
  homes: { id: string; name: string; staffCount: number }[];
  teams: { id: string; name: string; homeId: string | null; staffCount: number }[];
  roles: { id: string; name: string; staffCount: number }[];
}

export interface ConversationPage {
  items: ApiConversation[];
  hasMore: boolean;
}

export interface MessagingSettings {
  readReceipts: "all" | "priority_only" | "off";
  maxMessageLength: number;
  attachmentsEnabled: boolean;
}

/** Staff names by ID, for labelling messages and chats. */
export type NameMap = Record<string, string>;

/** Result of a server action: the value, or a message to show in a toast. */
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
