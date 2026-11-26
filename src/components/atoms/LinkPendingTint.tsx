"use client";

import { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

// Put inside a <Link> (with `relative isolate` on it): tints the link while its page loads, so a
// click shows at once even when the next page waits on the server. Always rendered (opacity only),
// so nothing shifts. No Figma frame: uses the sidebar's white-500 hover/active fill.
export interface LinkPendingTintProps {
  className?: string;
}

export function LinkPendingTint({ className }: LinkPendingTintProps) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 bg-white-500 opacity-0 transition-opacity duration-150",
        pending && "opacity-100",
        className,
      )}
    />
  );
}
