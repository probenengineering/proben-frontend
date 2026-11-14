"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";

import { EmojiPicker } from "./EmojiPicker";

// The ⋮ in a message's hover toolbar: Reply, React, Edit, Copy Text, Forward, Delete.
// React swaps the menu for the emoji picker; the others report back via onAction.
// Labels: Figma "Inter Display" Medium −2%, built with Inter Medium −2% (agreed).
export type MessageAction = "reply" | "edit" | "copy" | "forward" | "delete";

const ACTIONS: { icon: IconName; label: string; action: MessageAction | "react" }[] = [
  { icon: "document-upload", label: "Reply", action: "reply" },
  { icon: "happyemoji-outline", label: "React", action: "react" },
  { icon: "edit", label: "Edit", action: "edit" },
  { icon: "copy-14", label: "Copy Text", action: "copy" },
  { icon: "forward-square", label: "Forward", action: "forward" },
  { icon: "trash", label: "Delete", action: "delete" },
];

export interface MessageActionsMenuProps {
  onAction?: (action: MessageAction) => void;
  onReact?: (emoji: string) => void;
  /** Actions to leave out, e.g. Edit and Delete on someone else's message. */
  hide?: MessageAction[];
}

export function MessageActionsMenu({ onAction, onReact, hide = [] }: MessageActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const close = () => {
    setOpen(false);
    setPicking(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPicking(false);
      }}
    >
      <PopoverTrigger aria-label="More actions" className="flex">
        <Icon name="more-vert" size={14} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        // Figma: the menu's top sits 7px above the ⋮ icon's bottom, its right edge 11px left of it.
        sideOffset={-7}
        alignOffset={11}
        className="w-auto min-w-45.5 gap-0 rounded-[16px] border border-white-400 bg-white p-1 shadow-none ring-0 drop-shadow-[0_4px_2px_rgba(230,230,230,0.25)]"
      >
        {picking ? (
          <EmojiPicker
            onPick={(emoji) => {
              onReact?.(emoji);
              close();
            }}
          />
        ) : (
          <div className="flex flex-col px-2">
            {ACTIONS.filter((item) => item.action === "react" || !hide.includes(item.action)).map(
              (item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.action === "react") return setPicking(true);
                    close();
                    onAction?.(item.action);
                  }}
                  className="flex w-full items-center gap-3 rounded-[4px] p-2 text-left type-paragraph-sm font-medium tracking-[-0.02em] text-grey-700"
                >
                  <Icon name={item.icon} size={14} />
                  {item.label}
                </button>
              ),
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
