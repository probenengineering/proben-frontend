"use client";

import { type ReactNode, useId, useState } from "react";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// A titled group in the chat list ("Pinned chats", "Groups", ...). The header toggles the list:
// open shows ▾, collapsed shows ▴ (as in Figma's inbox frames).
export interface ChatSectionProps {
  title: string;
  /** Kept for the sample frames; the arrow now follows the open/collapsed state. */
  arrow?: "up" | "down";
  /** Start collapsed (header only). */
  collapsed?: boolean;
  children?: ReactNode;
}

export function ChatSection({ title, collapsed = false, children }: ChatSectionProps) {
  const [open, setOpen] = useState(!collapsed);
  const listId = useId();
  return (
    <section className={cn("flex w-full flex-col px-6", open && "gap-5")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center justify-between text-left"
      >
        <h2 className="type-paragraph-sm font-medium text-black">{title}</h2>
        <Icon name={open ? "arrow-down" : "arrow-up"} size={16} />
      </button>
      {open && (
        <div id={listId} className="flex flex-col gap-2">
          {children}
        </div>
      )}
    </section>
  );
}
