"use client";

import { useRef, useState } from "react";

import { Icon, Input } from "@/components/atoms";
import { cn } from "@/lib/utils";

import { EmojiButton } from "./EmojiButton";
import { FileAttachment } from "./FileAttachment";
import { ReplyBar } from "./ReplyBar";

// "Type a message" box at the bottom of a chat: emoji, gallery, attach, add, divider, send.
// Enter or send posts the text; gallery picks an image, attach and + pick any file.
// Picked files wait in the box as cards with a ✕ (Figma 13:43326) until sent or removed.
export interface MessageComposerProps {
  onSend: (text: string) => void;
  onAttach: (file: File) => void;
  /** Files waiting to be sent, shown above the text. */
  files?: { id: string; name: string; size: string }[];
  onRemoveFile?: (id: string) => void;
  /** The message being replied to, shown above the box. */
  reply?: { author: string; text: string };
  onCancelReply?: () => void;
  /** Longest message allowed (from the messaging settings). */
  maxLength?: number;
}

export function MessageComposer({
  onSend,
  onAttach,
  files = [],
  onRemoveFile,
  reply,
  onCancelReply,
  maxLength,
}: MessageComposerProps) {
  const [value, setValue] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const hasFiles = files.length > 0;

  const submit = () => {
    const text = value.trim();
    if (!text && !hasFiles) return;
    onSend(text);
    setValue("");
  };
  const picker = (ref: typeof imageInput, accept?: string) => (
    <input
      ref={ref}
      type="file"
      accept={accept}
      multiple
      hidden
      onChange={(e) => {
        Array.from(e.target.files ?? []).forEach(onAttach);
        e.target.value = "";
      }}
    />
  );

  return (
    <div className="flex w-full flex-col gap-2">
      {reply && <ReplyBar {...reply} onCancel={() => onCancelReply?.()} />}
      {/* Figma: 8px radius, #D9D9D9 border (line token). Empty: 20px/17px padding.
          With files: 12px padding, 16px gap, and the text row gets 8px/4px padding. */}
      <div
        className={cn(
          "flex w-full flex-col items-start rounded-md border border-line bg-white transition-colors focus-within:border-green-500 hover:border-green-500",
          hasFiles ? "gap-4 p-3" : "px-5 py-4.25",
        )}
      >
        {hasFiles && (
          <div className="flex max-w-full flex-wrap gap-3">
            {files.map((file) => (
              <FileAttachment
                key={file.id}
                name={file.name}
                size={file.size}
                variant="draft"
                onRemove={() => onRemoveFile?.(file.id)}
              />
            ))}
          </div>
        )}
        <Input
          aria-label="Message"
          placeholder="Type a message"
          value={value}
          maxLength={maxLength}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
            if (event.key === "Escape") onCancelReply?.();
          }}
          frameClassName={cn(
            "h-auto rounded-none border-0 p-0 hover:border-0",
            hasFiles && "px-2 py-1",
          )}
          // Figma: medium placeholder in black-50 (#808080).
          className="font-medium placeholder:text-black-50"
          iconRight={
            <span className="flex items-center gap-3">
              <EmojiButton onPick={(emoji) => setValue((v) => v + emoji)} />
              <button
                type="button"
                aria-label="Add image"
                onClick={() => imageInput.current?.click()}
              >
                <Icon name="gallery" />
              </button>
              <button
                type="button"
                aria-label="Attach file"
                onClick={() => fileInput.current?.click()}
              >
                <Icon name="attach-square" />
              </button>
              <button type="button" aria-label="More" onClick={() => fileInput.current?.click()}>
                <Icon name="add" />
              </button>
              <span className="h-3.75 w-px bg-black-10" />
              <button type="button" aria-label="Send" onClick={submit}>
                <Icon name="send" />
              </button>
            </span>
          }
        />
      </div>
      {picker(imageInput, "image/*")}
      {picker(fileInput)}
    </div>
  );
}
