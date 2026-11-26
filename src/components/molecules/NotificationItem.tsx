import { AnimatePresence, motion } from "motion/react";

import { EASE_OUT, Icon, IconButton, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/types/notification";

import { ArrowLink } from "./ArrowLink";

// One notification (Figma 51:11625): 40px boxed icon, title with a green dot while unread, the
// message (one line with "…" until expanded), "10 min ago · Schedule", then ✓ (mark as read)
// and › (expand). Expanded (51:12260): full message, ⌃, and a "View … →" link underneath.
// Figma draws schedule, tasks and homes; the other API categories reuse existing icons
// (unverified). Kinds without a page yet have no "View …" link; the item's own destination
// (a chat or a home) overrides the kind's default page.
const kinds: Record<
  NotificationKind,
  { icon: IconName; label: string; link?: { label: string; href: string } }
> = {
  homes: { icon: "home-linear", label: "Homes", link: { label: "View home", href: "/homes" } },
  schedule: {
    icon: "calendar-edit",
    label: "Schedule",
    link: { label: "View schedule", href: "/" },
  },
  tasks: { icon: "task-square", label: "Tasks", link: { label: "View task", href: "/tasks/list" } },
  messages: {
    icon: "message-text",
    label: "Messages",
    link: { label: "View message", href: "/messages" },
  },
  announcements: { icon: "message-notif", label: "Announcements" },
  attendance: { icon: "clock", label: "Attendance", link: { label: "View time clock", href: "/" } },
  hr_documents: { icon: "document-text", label: "HR documents" },
};

export interface NotificationItemProps {
  notification: AppNotification;
  expanded: boolean;
  onToggle: () => void;
  onMarkRead: () => void;
}

export function NotificationItem({
  notification,
  expanded,
  onToggle,
  onMarkRead,
}: NotificationItemProps) {
  const kind = kinds[notification.kind];
  return (
    <li className="flex flex-col gap-2.5 border-t border-white-400 bg-white px-5 py-3 first:border-t-0">
      <div className={cn("flex gap-2.5", expanded ? "items-start" : "items-center")}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-divider">
          <Icon name={kind.icon} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className={cn("flex flex-col", expanded && "gap-2")}>
            <p className="flex items-center gap-2.5 type-paragraph-sm font-medium text-grey-900">
              {notification.title}
              {!notification.read && (
                <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-green-link" />
              )}
            </p>
            <p className={cn("type-paragraph-sm text-grey-700", !expanded && "truncate")}>
              {notification.message}
            </p>
          </div>
          {/* Figma: Inter Tight 12px, 1.2 line height, 4% tracking; no exact text token. */}
          <p className="type-caption-sm font-sans! tracking-[0.04em] text-black-50 capitalize">
            {notification.time} · {kind.label}
          </p>
        </div>
        <IconButton
          size="lg"
          icon="tick-circle-outline"
          label="Mark as read"
          onClick={onMarkRead}
          disabled={notification.read}
          className="disabled:cursor-default"
        />
        <IconButton
          size="lg"
          icon={expanded ? "arrow-up" : "arrow-right"}
          label={expanded ? "Collapse" : "Expand"}
          aria-expanded={expanded}
          onClick={onToggle}
        />
      </div>
      <AnimatePresence initial={false}>
        {expanded && kind.link && (
          <motion.div
            className="flex overflow-hidden pl-10"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <ArrowLink href={notification.href ?? kind.link.href}>{kind.link.label}</ArrowLink>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
