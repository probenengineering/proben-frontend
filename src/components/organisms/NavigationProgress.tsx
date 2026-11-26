"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// A thin bar across the top of the content while a page loads. Pages wait for their data before
// replacing the current one (no blank or skeleton flash), so this is the immediate response to a
// click. Starts on a click on an in-app link to another URL; ends as soon as the URL changes (or
// after 15s as a safety net). No Figma frame: 2px green-500 bar.
const SAFETY_MS = 15_000;

function inAppTarget(event: MouseEvent) {
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return false;
  if (link.hasAttribute("download")) return false;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return false;
  return url.pathname + url.search !== location.pathname + location.search;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const current = `${pathname}?${query}`;
  // The URL a navigation started from; loading while we're still on it.
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const loading = startedAt === current;

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (inAppTarget(event)) setStartedAt(`${location.pathname}?${location.search.slice(1)}`);
    };
    // Capture phase: runs before <Link> handles the click (and marks it defaultPrevented).
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setStartedAt(null), SAFETY_MS);
    return () => clearTimeout(id);
  }, [loading]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
    >
      <div
        className={cn(
          "h-full w-1/3 bg-green-500 opacity-0 transition-opacity duration-200",
          loading && "animate-nav-progress opacity-100",
        )}
      />
    </div>
  );
}
