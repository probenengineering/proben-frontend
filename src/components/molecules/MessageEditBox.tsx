"use client";

import { useState } from "react";

import { Icon, Input } from "@/components/atoms";

import { EmojiButton } from "./EmojiButton";

// Inline editor shown in place of a message's text (Figma: outlined box, #D9D9D9 line border,
// 8px radius, 16px/8px padding, emoji + divider + send). Enter or send saves, Esc cancels.
export interface MessageEditBoxProps {
  defaultValue: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export function MessageEditBox({ defaultValue, onSave, onCancel }: MessageEditBoxProps) {
  const [value, setValue] = useState(defaultValue);
  const save = () => onSave(value.trim() || defaultValue);

  return (
    <Input
      aria-label="Edit message"
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") save();
        if (event.key === "Escape") onCancel();
      }}
      frameClassName="h-auto rounded-md border-line bg-transparent px-4 py-2"
      className="text-grey-700"
      iconRight={
        <span className="flex items-center gap-3">
          <EmojiButton onPick={(emoji) => setValue((v) => v + emoji)} />
          <span className="h-3.75 w-px bg-black-10" />
          <button type="button" aria-label="Save edit" className="flex" onClick={save}>
            <Icon name="send" />
          </button>
        </span>
      }
    />
  );
}
