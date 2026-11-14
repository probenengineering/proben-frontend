"use client";

import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

import { useConversationMessages } from "@/hooks/useConversationMessages";
import type { ChatMessageData, MessageDay } from "@/lib/chat-types";
import {
  deleteMessage,
  editMessage,
  forwardMessage,
  sendMessage,
  setReaction,
} from "@/lib/messaging/actions";
import type { ChatTarget } from "@/lib/messaging/inbox";
import { groupByDay, withReaction } from "@/lib/messaging/mappers";
import type { ActionResult, ApiMessage, MessagePage, NameMap } from "@/lib/messaging/types";
import { showToast } from "@/lib/toast";

// State and actions for the open chat, backed by the messaging API.
// Sending shows the message straight away and retries with the same clientMessageId (the server
// ignores duplicates). Edit, delete and reactions change the screen first and undo on failure.

interface ChatStore {
  days: MessageDay[];
  replyTo: ChatMessageData | null;
  setReplyTo: (message: ChatMessageData | null) => void;
  send: (text: string) => void;
  sendFile: (file: File) => void;
  edit: (id: string, text: string) => void;
  remove: (id: string) => void;
  toggleReaction: (id: string, emoji: string) => void;
  forward: (id: string, conversationIds: string[]) => void;
  /** Chats a message can be forwarded to. */
  targets: ChatTarget[];
  hasMore: boolean;
  loadOlder: () => void;
  maxLength?: number;
}

const ChatContext = createContext<ChatStore | null>(null);

export interface ChatProviderProps {
  conversationId: string;
  meId: string;
  initialPage: MessagePage;
  names: NameMap;
  targets: ChatTarget[];
  maxLength?: number;
  children: ReactNode;
}

async function sendWithRetry(conversationId: string, input: Parameters<typeof sendMessage>[1]) {
  let result = await sendMessage(conversationId, input);
  for (let attempt = 1; !result.ok && attempt < 3; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    result = await sendMessage(conversationId, input);
  }
  return result;
}

export function ChatProvider(props: ChatProviderProps) {
  const { conversationId, meId, targets, maxLength, children } = props;
  const { messages, names, hasMore, merge, drop, loadOlder } = useConversationMessages(
    conversationId,
    props.initialPage,
    props.names,
  );
  const [replyTo, setReplyTo] = useState<ChatMessageData | null>(null);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const find = (id: string) => messages.find((m) => m.id === id);
  /** Change a message now; put it back if the request fails. */
  const optimistic = async (
    id: string,
    change: (message: ApiMessage) => ApiMessage,
    request: () => Promise<ActionResult<ApiMessage>>,
  ) => {
    const before = find(id);
    if (!before) return;
    merge([change(before)]);
    const result = await request();
    merge([result.ok ? result.data : before]);
    if (!result.ok) showToast("error", result.error);
  };

  const days = useMemo(() => {
    const byId = new Map(messages.map((m) => [m.id, m]));
    return groupByDay(messages, { names, meId, byId }).map((day) => ({
      ...day,
      messages: day.messages.map((m) => (pending.has(m.id) ? { ...m, pending: true } : m)),
    }));
  }, [messages, names, meId, pending]);

  const send = (text: string) => {
    const clientMessageId = crypto.randomUUID();
    const replyToMessageId = replyTo?.id;
    const now = new Date().toISOString();
    merge([
      {
        id: clientMessageId,
        conversationId,
        seq: null,
        senderId: meId,
        kind: "user",
        body: text,
        status: "sent",
        replyToMessageId,
        createdAt: now,
      },
    ]);
    setPending((current) => new Set(current).add(clientMessageId));
    setReplyTo(null);
    void sendWithRetry(conversationId, { clientMessageId, body: text, replyToMessageId }).then(
      (result) => {
        drop(clientMessageId);
        setPending((current) => new Set([...current].filter((id) => id !== clientMessageId)));
        if (result.ok) merge([result.data]);
        else showToast("error", `Message not sent. ${result.error}`);
      },
    );
  };

  const store: ChatStore = {
    days,
    replyTo,
    setReplyTo,
    send,
    // Uploads need the files service's `source` value, which isn't documented yet.
    sendFile: () => showToast("error", "Sending files isn’t available yet."),
    edit: (id, text) =>
      void optimistic(
        id,
        (m) => ({ ...m, body: text }),
        () => editMessage(id, text),
      ),
    remove: (id) =>
      void optimistic(
        id,
        (m) => ({ ...m, retracted: true }),
        () => deleteMessage(id),
      ),
    toggleReaction: (id, emoji) => {
      const on = !find(id)?.reactions?.some((r) => r.emoji === emoji && r.staffIds.includes(meId));
      void optimistic(
        id,
        (m) => withReaction(m, emoji, meId, on),
        () => setReaction(id, emoji, on),
      );
    },
    forward: (id, conversationIds) => {
      if (conversationIds.length === 0) return;
      void forwardMessage(id, conversationIds).then((result) => {
        if (!result.ok) return showToast("error", result.error);
        const { sent, failed } = result.data;
        showToast(
          failed ? "error" : "success",
          failed ? `Forwarded to ${sent}, ${failed} failed` : "Message forwarded",
        );
      });
    },
    targets: targets.filter((t) => t.id !== conversationId),
    hasMore,
    loadOlder: () => void loadOlder(),
    maxLength,
  };

  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const store = useContext(ChatContext);
  if (!store) throw new Error("useChat must be used inside <ChatProvider>");
  return store;
}
