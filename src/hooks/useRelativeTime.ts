"use client";

import { useEffect, useState } from "react";

// "Updated 2 min ago" for a load time (epoch ms), refreshed every 30s. Empty until mounted so the
// server and browser render the same thing.
function label(at: number, now: number) {
  const minutes = Math.floor((now - at) / 60_000);
  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `Updated ${hours} hr${hours === 1 ? "" : "s"} ago`;
}

export function useRelativeTime(at?: number) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!at) return;
    const tick = () => setText(label(at, Date.now()));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [at]);
  return text;
}
