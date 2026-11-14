"use server";

import { apiBase, errorMessage, identity } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";

import { getMessages, lookupNames, messaging } from "./api";
import type { ActionResult, ApiMessage, MessagePage, NameMap } from "./types";

// Server actions behind the chat screens. Each returns { ok, data } or { ok: false, error } for a
// toast. The backend checks membership and permissions; these only pass the request on.

async function run<T>(call: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await call() };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

const id = (value: string) => encodeURIComponent(String(value));

export interface SendInput {
  /** Generated once per message by the browser and reused on retries, so nothing is sent twice. */
  clientMessageId: string;
  body: string;
  replyToMessageId?: string;
}

export async function sendMessage(conversationId: string, input: SendInput) {
  return run(() =>
    messaging<ApiMessage>(`/conversations/${id(conversationId)}/messages`, {
      body: {
        clientMessageId: String(input.clientMessageId),
        body: String(input.body),
        replyToMessageId: input.replyToMessageId || undefined,
      },
    }),
  );
}

export async function editMessage(messageId: string, body: string) {
  return run(() =>
    messaging<ApiMessage>(`/messages/${id(messageId)}`, {
      method: "PATCH",
      body: { body: String(body) },
    }),
  );
}

/** Deletes your message for everyone (the backend keeps it for audit). */
export async function deleteMessage(messageId: string) {
  return run(() => messaging<ApiMessage>(`/messages/${id(messageId)}`, { method: "DELETE" }));
}

export async function setReaction(messageId: string, emoji: string, on: boolean) {
  return run(() =>
    on
      ? messaging<ApiMessage>(`/messages/${id(messageId)}/reactions`, { body: { emoji } })
      : messaging<ApiMessage>(`/messages/${id(messageId)}/reactions/${id(emoji)}`, {
          method: "DELETE",
        }),
  );
}

/** Forwards one message to each chosen conversation. Returns how many went through. */
export async function forwardMessage(
  messageId: string,
  conversationIds: string[],
): Promise<ActionResult<{ sent: number; failed: number }>> {
  const results = await Promise.all(
    conversationIds.map((conversationId) =>
      run(() =>
        messaging<ApiMessage>(`/messages/${id(messageId)}/forward`, {
          body: { conversationId: String(conversationId), clientMessageId: crypto.randomUUID() },
        }),
      ),
    ),
  );
  const sent = results.filter((result) => result.ok).length;
  const firstError = results.find((result) => !result.ok);
  if (sent === 0 && firstError && !firstError.ok) return { ok: false, error: firstError.error };
  return { ok: true, data: { sent, failed: results.length - sent } };
}

/** Older messages (beforeSeq) or ones missed while offline (afterSeq). */
export async function loadMessages(
  conversationId: string,
  cursor: { beforeSeq?: number; afterSeq?: number },
): Promise<ActionResult<MessagePage>> {
  return run(() => getMessages(conversationId, cursor));
}

export async function lookupStaffNames(ids: string[]): Promise<NameMap> {
  return lookupNames(ids.slice(0, 200));
}

/** Mute (no notifications) or unmute a chat for yourself. */
export async function setMuted(conversationId: string, muted: boolean) {
  return run(() =>
    messaging(`/conversations/${id(conversationId)}/mute`, {
      method: muted ? "POST" : "DELETE",
      body: muted ? {} : undefined,
    }),
  );
}

/** Call only once messages are actually shown in the open chat. */
export async function markRead(conversationId: string, upToSeq: number) {
  return run(() =>
    messaging(`/conversations/${id(conversationId)}/read`, { body: { upToSeq: Number(upToSeq) } }),
  );
}

/** For messages that arrived over the live connection. */
export async function markDelivered(items: { conversationId: string; upToSeq: number }[]) {
  return run(() =>
    messaging("/receipts/delivered", {
      body: {
        items: items.map((item) => ({
          conversationId: String(item.conversationId),
          upToSeq: Number(item.upToSeq),
        })),
      },
    }),
  );
}

/**
 * A single-use ticket (valid 30s) to open the live connection, so the access token itself never
 * reaches the browser. Also returns the server address to connect to.
 */
export async function getSocketTicket(): Promise<ActionResult<{ url: string; ticket: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: "SESSION_ENDED" };
  return run(async () => {
    const { ticket } = await identity<{ ticket: string }>("/auth/socket-ticket", {
      method: "POST",
      accessToken,
    });
    return { url: apiBase(), ticket };
  });
}
