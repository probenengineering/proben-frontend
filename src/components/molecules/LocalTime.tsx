"use client";

import { useSyncExternalStore } from "react";

// "1:45 PM" on the device clock, updated every 10 seconds. Empty until hydration, so the time
// is never read during prerender.
const subscribe = (notify: () => void) => {
  const id = window.setInterval(notify, 10_000);
  return () => window.clearInterval(id);
};
const read = () =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());

export function LocalTime() {
  return <>{useSyncExternalStore(subscribe, read, () => "")}</>;
}
