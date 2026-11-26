"use client";

import Link from "next/link";

import { Avatar, type AvatarProps, Icon } from "@/components/atoms";
import { showToast } from "@/lib/toast";

// Top bar of an open chat: avatar and name, then call, video, a divider and "more" (opens the profile).
// Phones: a back arrow to the chat list comes first (not in Figma; Figma's arrow-right, flipped).
// Calls need the audio/video service, which isn't specified yet: the buttons say so.
export interface ConversationHeaderProps {
  name: string;
  avatarSrc?: string;
  /** Initials and colour when there's no photo. */
  avatar?: Pick<AvatarProps, "initials" | "color">;
  /** Where the "more" icon goes, e.g. the profile panel. */
  moreHref: string;
  /** Where the phone back arrow goes, e.g. the chat list. */
  backHref?: string;
  /** Show the call buttons (hidden for people without messaging.calls.start). */
  canCall?: boolean;
}

const callsNotReady = () => showToast("error", "Voice and video calls aren’t available yet.");

export function ConversationHeader({
  name,
  avatarSrc,
  avatar,
  moreHref,
  backHref = "/messages",
  canCall = true,
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
      <div className="flex items-center gap-3">
        {canCall && (
          <>
            <button type="button" aria-label="Call" onClick={callsNotReady}>
              <Icon name="call" />
            </button>
            <button type="button" aria-label="Video call" onClick={callsNotReady}>
              <Icon name="video" />
            </button>
            <span className="h-3.75 w-px bg-black-10" />
          </>
        )}
        <Link href={moreHref} aria-label="View profile">
          <Icon name="more-circle" />
        </Link>
      </div>
    </div>
  );
}
