"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { getSocketTicket, markDelivered } from "@/lib/messaging/actions";
import type { ApiMessage } from "@/lib/messaging/types";

// One live connection (Socket.IO) for the messages screens (Proben-Chat-Guide.md section 9).
// Signs in with a single-use ticket, fetched again for every reconnect, so the access token stays
// in its HttpOnly cookie. Sending goes through REST; this only receives.
// - New messages: confirm delivery, and refresh the chat list (server data) shortly after.
// - Reconnect: "reconnected" so the open chat can fetch what it missed, and refresh the list.
// - Session ended: back to sign-in.

export type RealtimeEvent =
  "message.new" | "message.updated" | "receipts.updated" | "conversation.updated" | "reconnected";
type Handler = (payload: unknown) => void;

interface Realtime {
  /** Listen for an event; returns the function that stops listening. */
  on: (event: RealtimeEvent, handler: Handler) => () => void;
}

const RealtimeContext = createContext<Realtime | null>(null);

/** Socket payloads aren't documented beyond message.new ({ conversationId, message }). */
export function messageFrom(payload: unknown): ApiMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const value = "message" in payload ? (payload as { message: unknown }).message : payload;
  return value && typeof value === "object" && "id" in value ? (value as ApiMessage) : null;
}

function createRealtime() {
  const handlers = new Map<RealtimeEvent, Set<Handler>>();
  return {
    on: (event: RealtimeEvent, handler: Handler) => {
      const set = handlers.get(event) ?? new Set();
      set.add(handler);
      handlers.set(event, set);
      return () => void set.delete(handler);
    },
    emit: (event: RealtimeEvent, payload?: unknown) =>
      handlers.get(event)?.forEach((handler) => handler(payload)),
  };
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [realtime] = useState(createRealtime);

  useEffect(() => {
    let socket: Socket | undefined;
    let stopped = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let deliveredTimer: ReturnType<typeof setTimeout> | undefined;
    const delivered = new Map<string, number>();

    const refreshSoon = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 400);
    };
    const signOut = () => {
      socket?.disconnect();
      router.push("/sign-in");
    };
    const confirmDelivered = (message: ApiMessage) => {
      // Includes your own messages from other devices; confirming those is harmless.
      if (message.seq === null) return;
      const seen = delivered.get(message.conversationId) ?? 0;
      delivered.set(message.conversationId, Math.max(seen, message.seq));
      clearTimeout(deliveredTimer);
      deliveredTimer = setTimeout(() => {
        const items = [...delivered].map(([conversationId, upToSeq]) => ({
          conversationId,
          upToSeq,
        }));
        delivered.clear();
        void markDelivered(items);
      }, 300);
    };

    void (async () => {
      const first = await getSocketTicket();
      if (stopped) return;
      if (!first.ok) {
        if (first.error === "SESSION_ENDED") signOut();
        return;
      }
      let ticket: string | undefined = first.data.ticket;
      let connectedBefore = false;

      socket = io(first.data.url, {
        path: "/realtime/socket.io",
        transports: ["websocket"],
        // Called on every (re)connect: the first ticket once, then a fresh one each time.
        auth: (send) => {
          if (ticket) {
            send({ ticket });
            ticket = undefined;
            return;
          }
          void getSocketTicket().then((next) => send(next.ok ? { ticket: next.data.ticket } : {}));
        },
      });
      socket.on("connect", () => {
        if (connectedBefore) {
          realtime.emit("reconnected");
          refreshSoon();
        }
        connectedBefore = true;
      });
      socket.on("message.new", (payload: unknown) => {
        const message = messageFrom(payload);
        if (message) confirmDelivered(message);
        realtime.emit("message.new", payload);
        refreshSoon();
      });
      for (const event of [
        "message.updated",
        "receipts.updated",
        "conversation.updated",
      ] as const) {
        socket.on(event, (payload: unknown) => {
          realtime.emit(event, payload);
          if (event !== "receipts.updated") refreshSoon();
        });
      }
      socket.on("session.ended", signOut);
      socket.on("connect_error", (error: Error & { data?: { code?: string } }) => {
        const code = error.data?.code ?? "";
        if (code === "SESSION_REVOKED" || code === "SESSION_ENDED") signOut();
      });
    })();

    return () => {
      stopped = true;
      clearTimeout(refreshTimer);
      clearTimeout(deliveredTimer);
      socket?.disconnect();
    };
  }, [router, realtime]);

  return <RealtimeContext.Provider value={realtime}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): Realtime {
  const realtime = useContext(RealtimeContext);
  if (!realtime) throw new Error("useRealtime must be used inside <RealtimeProvider>");
  return realtime;
}
