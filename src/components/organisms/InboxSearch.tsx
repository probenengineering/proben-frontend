"use client";

import { useEffect, useRef, useState } from "react";

import { SearchField } from "@/components/molecules";
import { useInboxFilters } from "@/hooks/useInboxFilters";
import type { InboxFilters } from "@/lib/messaging/filters";

// The Inbox header search: finds chats by title or message text (the API searches) as you type,
// 350ms after the last key. ⌘K / Ctrl+K focuses it, as the key hint in the box says.
export interface InboxSearchProps {
  filters?: InboxFilters;
  className?: string;
}

export function InboxSearch({ filters: current, className }: InboxSearchProps) {
  const { filters, update } = useInboxFilters(current);
  const [text, setText] = useState(filters.q);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const focus = (event: KeyboardEvent) => {
      // The header has a phone and a desktop copy; only the visible one takes focus.
      const visible = input.current?.offsetParent !== null;
      if (visible && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", focus);
    return () => {
      window.removeEventListener("keydown", focus);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <SearchField
      ref={input}
      aria-label="Search chats"
      value={text}
      onChange={(event) => {
        const q = event.target.value;
        setText(q);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => update({ q: q.trim() }), 350);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setText("");
          update({ q: "" });
        }
      }}
      className={className}
    />
  );
}
