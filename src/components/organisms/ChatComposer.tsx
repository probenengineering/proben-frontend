"use client";

import { useState } from "react";

import { MessageComposer } from "@/components/molecules";
import { useChat } from "@/lib/chat-store";
import { sizeLabel } from "@/lib/messaging/mappers";

// The message box wired to the chat: sends text, shows the reply being written, and keeps picked
// files in the box until they're sent or removed. Sending files isn't available yet (the store says
// so), so they stay in the box after Send.
export interface ChatComposerProps {
  /** Show the attach buttons (hidden when this person may not send files). */
  canAttach?: boolean;
}

export function ChatComposer({ canAttach = true }: ChatComposerProps) {
  const { send, sendFile, replyTo, setReplyTo, maxLength } = useChat();
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);

  return (
    <MessageComposer
      onSend={(text) => {
        if (text) send(text);
        if (files[0]) sendFile(files[0].file);
      }}
      onAttach={(file) => setFiles((current) => [...current, { id: crypto.randomUUID(), file }])}
      files={files.map(({ id, file }) => ({ id, name: file.name, size: sizeLabel(file.size) }))}
      onRemoveFile={(id) => setFiles((current) => current.filter((f) => f.id !== id))}
      maxLength={maxLength}
      canAttach={canAttach}
      reply={
        replyTo
          ? { author: replyTo.author, text: replyTo.text ?? replyTo.attachment?.name ?? "" }
          : undefined
      }
      onCancelReply={() => setReplyTo(null)}
    />
  );
}
