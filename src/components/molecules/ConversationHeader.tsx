"use client";

import Link from "next/link";

import { Avatar, type AvatarProps, Icon } from "@/components/atoms";

// Top bar of an open chat: avatar and name, then "more" (opens the profile).
// Phones: a back arrow to the chat list comes first (not in Figma; Figma's arrow-right, flipped).
// Figma's call and video buttons are left out on request (no calling service yet).
export interface ConversationHeaderProps {
  name: string;
  avatarSrc?: string;
  /** Initials and colour when there's no photo. */
  avatar?: Pick<AvatarProps, "initials" | "color">;
  /** Where the "more" icon goes, e.g. the profile panel. */
  moreHref: string;
  /** Where the phone back arrow goes, e.g. the chat list. */
  backHref?: string;
}

export function ConversationHeader({
  name,
  avatarSrc,
  avatar,
  moreHref,
  backHref = "/messages",
}: ConversationHeaderProps) {
  return (
    <div className="flex h-17.75 w-full shrink-0 items-center justify-between border-b border-divider px-5 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link href={backHref} aria-label="Back to chats" className="flex md:hidden">
          <Icon name="arrow-right" size={20} className="rotate-180" />
        </Link>
        <Avatar src={avatarSrc} {...avatar} />
        <p className="truncate type-paragraph-sm font-medium text-black">{name}</p>
      </div>
      <Link href={moreHref} aria-label="View profile">
        <Icon name="more-circle" />
      </Link>
    </div>
  );
}
