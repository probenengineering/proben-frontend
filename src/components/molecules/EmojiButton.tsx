"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";

import { EmojiPicker } from "./EmojiPicker";

// An emoji icon button that opens the emoji picker above it (same card style as our menus).
export interface EmojiButtonProps {
  onPick: (emoji: string) => void;
  icon?: IconName;
  size?: number;
  label?: string;
}

export function EmojiButton({
  onPick,
  icon = "happyemoji",
  size = 20,
  label = "Emoji",
}: EmojiButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={label} className="flex">
        <Icon name={icon} size={size} />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-auto gap-0 rounded-[16px] border border-white-400 bg-white p-1 shadow-none ring-0 drop-shadow-[0_4px_2px_rgba(230,230,230,0.25)]"
      >
        <EmojiPicker
          onPick={(emoji) => {
            onPick(emoji);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
