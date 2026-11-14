"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadMessages, lookupStaffNames, markRead } from "@/lib/messaging/actions";
import type { ApiMessage, MessagePage, NameMap } from "@/lib/messaging/types";
import { messageFrom, useRealtime } from "@/lib/realtime";

// The messages of one open chat, kept in sync (Proben-Chat-Guide.md sections 7–9):
// merged by id and ordered by seq; live events merged in; after a reconnect, everything since the
// highest seq is fetched; older pages load on demand; read is recorded only while the chat is visible.

const bySeq = (a: ApiMessage, b: ApiMessage) =>
  (a.seq ?? Number.MAX_SAFE_INTEGER) - (b.seq ?? Number.MAX_SAFE_INTEGER);

function mergeInto(current: ApiMessage[], incoming: ApiMessage[]) {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(bySeq);
}

const highestSeq = (messages: ApiMessage[]) =>
  messages.reduce((max, m) => (m.seq !== null && m.seq > max ? m.seq : max), 0);

export function useConversationMessages(
  conversationId: string,
  initialPage: MessagePage,
  initialNames: NameMap,
) {
  const realtime = useRealtime();
  const [messages, setMessages] = useState(() => [...initialPage.items].sort(bySeq));
  const [names, setNames] = useState(initialNames);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const latest = useRef(messages);
  const readSeq = useRef(initialPage.lastReadSeq);
  const loadingOlder = useRef(false);
  const [seenPage, setSeenPage] = useState(initialPage);
  const [seenNames, setSeenNames] = useState(initialNames);

  // A page refresh (after a live event) brings the latest page and names again: merge them in.
  if (seenPage !== initialPage) {
    setSeenPage(initialPage);
    setMessages((current) => mergeInto(current, initialPage.items));
  }
  if (seenNames !== initialNames) {
    setSeenNames(initialNames);
    setNames((current) => ({ ...initialNames, ...current }));
  }

  useEffect(() => {
    latest.current = messages;
  }, [messages]);

  const merge = useCallback((incoming: ApiMessage[]) => {
    if (incoming.length) setMessages((current) => mergeInto(current, incoming));
  }, []);
  const drop = useCallback((id: string) => {
    setMessages((current) => current.filter((m) => m.id !== id));
  }, []);

  // Names for people not seen yet (e.g. someone new in a group).
  useEffect(() => {
    const missing = [...new Set(messages.map((m) => m.senderId ?? ""))].filter(
      (id) => id && !names[id],
    );
    if (missing.length === 0) return;
    let cancelled = false;
    void lookupStaffNames(missing).then((found) => {
      if (!cancelled && Object.keys(found).length)
        setNames((current) => ({ ...current, ...found }));
    });
    return () => {
      cancelled = true;
    };
  }, [messages, names]);

  const catchUp = useCallback(async () => {
    let afterSeq = highestSeq(latest.current);
    for (let page = 0; page < 20; page++) {
      const result = await loadMessages(conversationId, { afterSeq });
      if (!result.ok) return;
      merge(result.data.items);
      if (!result.data.hasMore || result.data.items.length === 0) return;
      afterSeq = highestSeq(result.data.items);
    }
  }, [conversationId, merge]);

  useEffect(() => {
    const forThisChat = (payload: unknown) => {
      const message = messageFrom(payload);
      if (message) {
        if (message.conversationId === conversationId) merge([message]);
        return;
      }
      // An update without the full message: fetch the latest page instead.
      void loadMessages(conversationId, {}).then((r) => r.ok && merge(r.data.items));
    };
    const stops = [
      realtime.on("message.new", forThisChat),
      realtime.on("message.updated", forThisChat),
      realtime.on("reconnected", () => void catchUp()),
    ];
    return () => stops.forEach((stop) => stop());
  }, [realtime, conversationId, merge, catchUp]);

  // Read receipts: only while this chat is on screen and the tab is visible.
  useEffect(() => {
    const record = () => {
      const seq = highestSeq(latest.current);
      if (document.visibilityState !== "visible" || seq <= readSeq.current) return;
      readSeq.current = seq;
      void markRead(conversationId, seq);
    };
    record();
    document.addEventListener("visibilitychange", record);
    return () => document.removeEventListener("visibilitychange", record);
  }, [conversationId, messages]);

  const loadOlder = useCallback(async () => {
    const oldest = latest.current.find((m) => m.seq !== null)?.seq;
    if (loadingOlder.current || !hasMore || !oldest) return;
    loadingOlder.current = true;
    const result = await loadMessages(conversationId, { beforeSeq: oldest });
    loadingOlder.current = false;
    if (!result.ok) return;
    merge(result.data.items);
    setHasMore(result.data.hasMore);
  }, [conversationId, hasMore, merge]);

  return { messages, names, hasMore, merge, drop, loadOlder };
}
