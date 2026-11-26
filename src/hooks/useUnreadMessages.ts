"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getUnreadMessageCount } from "@/lib/messaging/actions";
import { useRealtime } from "@/lib/realtime";

// Live unread-message count for the signed-in person. Loads once, then asks the API again
// (debounced) whenever a message arrives, a chat changes, receipts move or the connection comes
// back, and after each page change (opening a chat marks it read). The API stays the source of
// truth, so own messages and muted chats count exactly as the backend says.
export function useUnreadMessages(): number {
  const realtime = useRealtime();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void getUnreadMessageCount().then((next) => active && setCount(next));
      }, 400);
    };
    load();
    const stops = (
      ["message.new", "conversation.updated", "receipts.updated", "reconnected"] as const
    ).map((event) => realtime.on(event, load));
    return () => {
      active = false;
      clearTimeout(timer);
      stops.forEach((stop) => stop());
    };
  }, [realtime, pathname]);

  return count;
}
