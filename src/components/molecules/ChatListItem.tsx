import Link from "next/link";
import type { ReactNode } from "react";

import { CountBadge, LinkPendingTint } from "@/components/atoms";
import { cn } from "@/lib/utils";

// One row in the chat list: avatar, name, last message (cut off with …), time, optional unread count.
export interface ChatListItemProps {
  /** An <Avatar /> or, for groups, an <AvatarPair />. */
  avatar: ReactNode;
  name: string;
  preview: string;
  time: string;
  /** "caption": small 12px time (Figma uses it above an unread count on group rows). */
  timeVariant?: "default" | "caption";
  unread?: number;
  /** Group rows sit the time 8px from the text instead of 12px, as in Figma. */
  group?: boolean;
  /** Opens the conversation. */
  href?: string;
}

export function ChatListItem({
  avatar,
  name,
  preview,
  time,
  timeVariant = "default",
  unread,
  group,
  href,
}: ChatListItemProps) {
  const timeText = (
    <p
      className={cn(
        "whitespace-nowrap text-black",
        // Same one-off caption as the verify-email screen: Inter Tight, 4% letter spacing.
        timeVariant === "caption"
          ? "type-caption-sm font-sans! tracking-[0.04em]! capitalize"
          : "type-paragraph-sm",
      )}
    >
      {time}
    </p>
  );

  const content = (
    <div className={cn("flex min-w-0 flex-1 items-end", group ? "gap-2" : "gap-3")}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {avatar}
        <div className="flex min-w-0 flex-1 flex-col type-paragraph-sm">
          <p className="font-medium text-grey-900">{name}</p>
          <p className="truncate text-grey-700">{preview}</p>
        </div>
      </div>
      {unread ? (
        <div
          className={cn(
            "flex shrink-0 flex-col items-center",
            timeVariant === "caption" && "gap-0.5",
          )}
        >
          {timeText}
          <CountBadge count={unread} />
        </div>
      ) : (
        timeText
      )}
    </div>
  );

  const rowClass = "flex w-full items-center py-3";
  return href ? (
    // The row tints the moment it's clicked, while the chat loads.
    <Link href={href} className={cn(rowClass, "relative isolate")}>
      <LinkPendingTint className="-inset-x-2 rounded-[8px]" />
      {content}
    </Link>
  ) : (
    <div className={rowClass}>{content}</div>
  );
}
