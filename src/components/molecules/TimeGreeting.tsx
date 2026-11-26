"use client";

import { useSyncExternalStore } from "react";

// "Good morning, George" by the device's clock. The server (and first paint) say "Hello", so
// the hour is never read during prerender; it updates as soon as the page hydrates.
export interface TimeGreetingProps {
  /** First name; empty when signed out. */
  name?: string;
}

const subscribeNever = () => () => {};
const readHour = () => new Date().getHours();

export function TimeGreeting({ name }: TimeGreetingProps) {
  const hour = useSyncExternalStore(subscribeNever, readHour, () => null);
  const salutation =
    hour === null
      ? "Hello"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";
  return <>{name ? `${salutation}, ${name}` : salutation}</>;
}
