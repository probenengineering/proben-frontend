import type { ReactNode } from "react";

import { ConversationHeader, type ConversationHeaderProps } from "@/components/molecules";

import { ChatComposer } from "./ChatComposer";

// Figma: an open chat. Header, the messages (scrolling), the message box.
// With no messages it shows a centred "Today 00:00" like the empty-chat frame.
export interface ConversationProps {
  name: string;
  avatarSrc?: string;
  avatar?: ConversationHeaderProps["avatar"];
  /** Where "more" in the header goes (the profile panel). */
  profileHref: string;
  /** The message thread. Leave out for an empty chat. */
  children?: ReactNode;
  /** Show the attach buttons (messaging.attachments.send and the provider allows files). */
  canAttach?: boolean;
  /** Show the call buttons (messaging.calls.start). */
  canCall?: boolean;
}

export function Conversation({
  name,
  avatarSrc,
  avatar,
  profileHref,
  children,
  canAttach = true,
  canCall = true,
}: ConversationProps) {
  return (
    <section className="flex h-full w-full flex-col items-center pb-5">
      <ConversationHeader
        name={name}
        avatarSrc={avatarSrc}
        avatar={avatar}
        moreHref={profileHref}
        canCall={canCall}
      />
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        {children ?? (
          <p className="my-auto w-full text-center type-paragraph-sm font-medium text-black-60">
            Today 00:00
          </p>
        )}
      </div>
      <div className="w-full px-5">
        <ChatComposer canAttach={canAttach} />
      </div>
    </section>
  );
}
