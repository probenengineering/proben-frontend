"use client";

import { useState } from "react";

import { Avatar, Button, Checkbox, Icon, Input } from "@/components/atoms";
import { MessagePreview, type MessagePreviewProps } from "@/components/molecules";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";
import type { ChatAvatar } from "@/lib/chat-types";

// Figma "Forward to" dialog: message preview, search, chats to tick, Cancel / Forward.
// The main button is red "Forward" (Figma says "Delete"; agreed to relabel).
// Lists your existing chats; search filters them by name. Forward is disabled until one is ticked.

export interface ForwardTarget {
  id: string;
  name: string;
  avatar: ChatAvatar;
}

export interface ForwardMessageDialogProps {
  message: MessagePreviewProps | null;
  /** Chats the message can be sent to. */
  targets: ForwardTarget[];
  onOpenChange: (open: boolean) => void;
  /** Called with the ticked chats' IDs, before the dialog closes. */
  onConfirm?: (conversationIds: string[]) => void;
}

export function ForwardMessageDialog({
  message,
  targets,
  onOpenChange,
  onConfirm,
}: ForwardMessageDialogProps) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const shown = targets.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));
  const change = (open: boolean) => {
    if (!open) {
      setQuery("");
      setPicked([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={message !== null} onOpenChange={change}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-none"
        className="flex max-h-[calc(100dvh-2rem)] w-100 flex-col items-center gap-6 overflow-y-auto rounded-[24px] border border-white-300 bg-white p-4 ring-0 sm:max-w-none"
      >
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <DialogTitle className="type-title-md font-medium text-black">Forward to</DialogTitle>
          <DialogDescription className="type-title-sm text-black-60">
            Select where you want to share this message.
          </DialogDescription>
        </div>
        {message && <MessagePreview {...message} />}

        <div className="flex w-full flex-col gap-3">
          <Input
            aria-label="Search chats"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            iconLeft={<Icon name="search" size={16} />}
            frameClassName="h-auto gap-2.5 rounded-[12px] border-white-400 py-3 pr-3 pl-4 type-title-sm"
            className="placeholder:text-black"
          />
          <div className="flex flex-col gap-3 py-2">
            {shown.length === 0 && (
              <p className="type-paragraph-sm text-black-60">No chats found</p>
            )}
            {shown.map((target) => (
              <label
                key={target.id}
                className="flex w-full cursor-pointer items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Avatar size="sm" {...target.avatar} />
                  <span className="type-paragraph-sm font-medium text-black">{target.name}</span>
                </span>
                {/* Figma: 14px boxes here (ticked shown as a 19px icon); kept 14px for both. */}
                <Checkbox
                  checked={picked.includes(target.id)}
                  onCheckedChange={(checked) =>
                    setPicked((current) =>
                      checked ? [...current, target.id] : current.filter((id) => id !== target.id),
                    )
                  }
                  className="size-3.5"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-5">
          <Button variant="ghost" onClick={() => change(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={picked.length === 0}
            onClick={() => {
              onConfirm?.(picked);
              change(false);
            }}
          >
            Forward
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
