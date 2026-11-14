"use client";

import { useEffect, useRef, useState } from "react";

import { ChatMessage, DateDivider, type MessageAction } from "@/components/molecules";
import { useChat } from "@/lib/chat-store";
import type { ChatMessageData } from "@/lib/chat-types";
import { copyText } from "@/lib/clipboard";
import { showToast } from "@/lib/toast";

import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { ForwardMessageDialog } from "./ForwardMessageDialog";

// Messages in an open chat, grouped by day with a date divider above each day (from the chat store).
// Reply → reply bar in the message box; Edit → inline editor; Copy → clipboard + toast;
// Delete / Forward → their dialogs. Scrolls to the newest message when one arrives; scrolling to
// the top loads older messages.

export function MessageThread() {
  const { days, edit, remove, toggleReaction, setReplyTo, forward, targets, hasMore, loadOlder } =
    useChat();
  const [dialog, setDialog] = useState<{ action: MessageAction; message: ChatMessageData } | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const start = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const newestId = days.at(-1)?.messages.at(-1)?.id;

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [newestId]);

  useEffect(() => {
    const marker = start.current;
    if (!marker || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && loadOlder());
    observer.observe(marker);
    return () => observer.disconnect();
  }, [hasMore, loadOlder]);

  const handle = (action: MessageAction, message: ChatMessageData) => {
    if (action === "reply") return setReplyTo(message);
    if (action === "edit") return setEditingId(message.id);
    if (action === "copy") {
      const text = message.text ?? message.attachment?.name ?? "";
      copyText(text)
        .then(() => showToast("success", "Message copied"))
        .catch(() => showToast("error", "Couldn’t copy the message"));
      return;
    }
    setDialog({ action, message });
  };
  const close = (open: boolean) => !open && setDialog(null);

  return (
    <div className="flex w-full flex-1 flex-col gap-5.5 py-5">
      <div ref={start} />
      {days.length === 0 && (
        // Figma's empty-chat frame.
        <p className="my-auto w-full text-center type-paragraph-sm font-medium text-black-60">
          Today 00:00
        </p>
      )}
      {days.map((day) => (
        <section key={day.label} className="flex w-full flex-col gap-5">
          <DateDivider label={day.label} />
          <div className="flex w-full flex-col gap-3">
            {day.messages.map(({ id, ...message }) => (
              <ChatMessage
                key={id}
                {...message}
                editing={editingId === id}
                onAction={(action) => handle(action, { id, ...message })}
                onReact={(emoji) => toggleReaction(id, emoji)}
                onEditSave={(text) => {
                  if (text.trim() && text !== message.text) edit(id, text.trim());
                  setEditingId(null);
                }}
                onEditCancel={() => setEditingId(null)}
              />
            ))}
          </div>
        </section>
      ))}
      <div ref={end} />

      <DeleteMessageDialog
        message={dialog?.action === "delete" ? dialog.message : null}
        onOpenChange={close}
        onConfirm={() => dialog && remove(dialog.message.id)}
      />
      <ForwardMessageDialog
        message={dialog?.action === "forward" ? dialog.message : null}
        targets={targets}
        onOpenChange={close}
        onConfirm={(ids) => dialog && forward(dialog.message.id, ids)}
      />
    </div>
  );
}
