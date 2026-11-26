"use client";

import Link from "next/link";

import { Icon } from "@/components/atoms";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { cn } from "@/lib/utils";

// Topbar bell → /notifications, with the live unread-message count on its top-right corner.
// No Figma frame for the count: it reuses the "Message alert" teal (unread) with white text,
// shrunk to a 16px pill. Hidden at zero; "99+" past 99.
export interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const count = useUnreadMessages();
  const label = count > 99 ? "99+" : String(count);

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} unread messages` : "Notifications"}
      className={cn("relative flex", className)}
    >
      <Icon name="notification-bing" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-unread px-1 type-paragraph-xs font-medium text-white"
        >
          {label}
        </span>
      )}
    </Link>
  );
}
