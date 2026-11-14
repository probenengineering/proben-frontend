import type {
  ChatAvatar,
  ChatMessageData,
  ChatPreviewData,
  ChatSectionData,
  MessageDay,
} from "@/lib/chat-types";

import type { ApiConversation, ApiMessage, NameMap } from "./types";

// Turns messaging API data into what the chat components draw. Pure: used on the server
// (chat list) and in the browser (thread). There are no profile photos yet, so avatars show initials.

const COLORS = ["peach", "pink", "orange"] as const;
const UNKNOWN = "Unknown";

export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Same person, same colour. */
export function avatarFor(id: string | null | undefined, name: string): ChatAvatar {
  const key = id ?? name;
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return { initials: initialsOf(name), color: COLORS[hash % COLORS.length] };
}

export const nameOf = (names: NameMap, id: string | null | undefined) =>
  (id && names[id]) || UNKNOWN;

const dayLabel = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
// Figma shows times like "0:58" and "12:58".
const timeLabel = (date: Date) =>
  `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
/** Where a chat file downloads from (src/app/api/files streams it with the session's token). */
export const fileHref = (fileId: string, name: string) =>
  `/api/files/${encodeURIComponent(fileId)}?name=${encodeURIComponent(name)}`;

/** "240kb", "2.4mb" like Figma's file cards. */
export const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))}kb`
    : `${(bytes / 1048576).toFixed(1)}mb`;

const sentDate = (message: ApiMessage) =>
  new Date(message.sentAt ?? message.createdAt ?? Date.now());

export interface MessageContext {
  names: NameMap;
  meId: string;
  /** Loaded messages by ID, to show what a reply quotes. */
  byId: Map<string, ApiMessage>;
}

function quoteOf(id: string, { names, byId }: MessageContext): ChatMessageData["replyTo"] {
  const quoted = byId.get(id);
  // A reply to a message that isn't loaded (older history) still shows that it's a reply.
  if (!quoted) return { author: "", text: "Earlier message", avatar: { color: "pink" } };
  const author = nameOf(names, quoted.senderId);
  return {
    author,
    text: quoted.retracted
      ? "Message deleted"
      : (quoted.body ?? quoted.attachments?.[0]?.name ?? ""),
    avatar: avatarFor(quoted.senderId, author),
  };
}

export function toChatMessage(message: ApiMessage, context: MessageContext): ChatMessageData {
  const { names, meId } = context;
  const author = nameOf(names, message.senderId);
  const attachment = message.attachments?.[0];
  return {
    id: message.id,
    author,
    avatar: avatarFor(message.senderId, author),
    time: timeLabel(sentDate(message)),
    text: message.body ?? undefined,
    attachment: attachment
      ? {
          name: attachment.name,
          size: sizeLabel(attachment.sizeBytes),
          href: fileHref(attachment.fileId, attachment.name),
        }
      : undefined,
    reactions: message.reactions?.map((r) => ({
      emoji: r.emoji,
      count: r.count,
      mine: r.staffIds.includes(meId),
    })),
    replyTo: message.replyToMessageId ? quoteOf(message.replyToMessageId, context) : undefined,
    mine: !!meId && message.senderId === meId,
  };
}

/** Messages (in seq order) under a date divider per day. Deleted, blocked and system ones are hidden. */
export function groupByDay(messages: ApiMessage[], context: MessageContext): MessageDay[] {
  const days: MessageDay[] = [];
  for (const message of messages) {
    if (message.retracted || message.kind === "system" || message.status === "blocked") continue;
    const label = dayLabel(sentDate(message));
    const chat = toChatMessage(message, context);
    const last = days.at(-1);
    if (last?.label === label) last.messages.push(chat);
    else days.push({ label, messages: [chat] });
  }
  return days;
}

/** The message with your reaction added (on) or taken away. */
export function withReaction(
  message: ApiMessage,
  emoji: string,
  meId: string,
  on: boolean,
): ApiMessage {
  const current = message.reactions?.find((r) => r.emoji === emoji);
  const others = (message.reactions ?? []).filter((r) => r.emoji !== emoji);
  const staffIds = (current?.staffIds ?? []).filter((id) => id !== meId);
  if (on) staffIds.push(meId);
  const reaction = { emoji, count: staffIds.length, staffIds };
  return { ...message, reactions: staffIds.length ? [...others, reaction] : others };
}

/** "3m", "5h", "2d" like Figma's chat list. */
function relativeTime(iso: string | null) {
  if (!iso) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / (60 * 24))}d`;
}

/** The other person's name in a direct chat; the group's name otherwise. */
export function conversationTitle(conversation: ApiConversation, names: NameMap, meId: string) {
  if (conversation.name) return conversation.name;
  return nameOf(
    names,
    conversation.participants.find((id) => id !== meId),
  );
}

export function toChatPreview(
  conversation: ApiConversation,
  names: NameMap,
  meId: string,
): ChatPreviewData {
  const name = conversationTitle(conversation, names, meId);
  const last = conversation.lastMessage;
  const sender = last && last.senderId === meId ? "You" : nameOf(names, last?.senderId);
  const others = conversation.participants.filter((id) => id !== meId);
  const isGroup = conversation.type !== "direct";
  const second = others[1];
  return {
    id: conversation.id,
    name,
    preview: last ? (isGroup ? `${sender}: ${last.preview}` : last.preview) : "No messages yet",
    time: relativeTime(conversation.lastMessageAt ?? conversation.updatedAt),
    unread: conversation.unreadCount || undefined,
    avatar: isGroup
      ? [
          avatarFor(others[0], nameOf(names, others[0])),
          avatarFor(second ?? conversation.id, second ? nameOf(names, second) : name),
        ]
      : avatarFor(others[0], name),
    href: `/messages/${conversation.id}`,
  };
}

export interface InboxSections {
  sections: ChatSectionData[];
  groupSections: ChatSectionData[];
  announcementSections: ChatSectionData[];
}

/** Chats tab: Pinned, Groups, Direct Messages. Groups tab: groups only. Announcements tab. */
export function toInboxSections(
  conversations: ApiConversation[],
  names: NameMap,
  meId: string,
): InboxSections {
  const rows = (list: ApiConversation[]) => list.map((c) => toChatPreview(c, names, meId));
  const section = (title: string, list: ApiConversation[]): ChatSectionData => ({
    title,
    arrow: "down",
    collapsed: list.length === 0,
    chats: rows(list),
  });
  const chats = conversations.filter((c) => c.type !== "announcement");
  const unpinned = chats.filter((c) => !c.pinnedAt);
  return {
    sections: [
      section(
        "Pinned chats",
        chats.filter((c) => c.pinnedAt),
      ),
      section(
        "Groups",
        unpinned.filter((c) => c.type === "group"),
      ),
      section(
        "Direct Messages",
        unpinned.filter((c) => c.type === "direct"),
      ),
    ],
    groupSections: [
      section(
        "Groups",
        chats.filter((c) => c.type === "group"),
      ),
    ],
    announcementSections: [
      section(
        "Announcements",
        conversations.filter((c) => c.type === "announcement"),
      ),
    ],
  };
}
