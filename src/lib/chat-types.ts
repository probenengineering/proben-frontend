import type { AvatarProps } from "@/components/atoms";

// Shapes the chat components draw: messages in a thread and rows in the chat list.
// Built from the messaging API by src/lib/messaging/mappers.ts.

export type ChatAvatar = Pick<AvatarProps, "src" | "color" | "initials">;

export interface Reaction {
  emoji: string;
  count: number;
  /** The signed-in user reacted with this emoji. */
  mine?: boolean;
}

export interface ChatMessageData {
  id: string;
  author: string;
  avatar: ChatAvatar;
  time: string;
  /** Can be left out for a file-only message. */
  text?: string;
  /** href downloads the file (see src/app/api/files). */
  attachment?: { name: string; size: string; href?: string };
  reactions?: Reaction[];
  /** The message this one replies to. */
  replyTo?: { author: string; text: string; avatar: ChatAvatar };
  /** Sent by the signed-in user: they can edit and delete it. */
  mine?: boolean;
  /** Still being sent. */
  pending?: boolean;
}

export interface MessageDay {
  label: string;
  messages: ChatMessageData[];
}

export type ChatAvatarData = Pick<AvatarProps, "src" | "color" | "status" | "ring" | "initials">;

export interface ChatPreviewData {
  id: string;
  name: string;
  preview: string;
  time: string;
  timeVariant?: "default" | "caption";
  unread?: number;
  /** One avatar, or two for a group. */
  avatar: ChatAvatarData | [ChatAvatarData, ChatAvatarData];
  href?: string;
}

export interface ChatSectionData {
  title: string;
  arrow: "up" | "down";
  collapsed?: boolean;
  chats: ChatPreviewData[];
}
