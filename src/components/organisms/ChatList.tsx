"use client";

import { Fragment, useState } from "react";

import { Avatar, Chip, Separator } from "@/components/atoms";
import { AvatarPair, ChatListItem, ChatSection, EmptyState } from "@/components/molecules";
import type { ChatAvatarData, ChatSectionData } from "@/lib/chat-types";

// Figma: chat list column (384px). Filter chips, then the sections given (Pinned, Groups, DMs).
// The chips switch between Chats, Groups and Announcements (no design yet: plain list or empty state).
export interface ChatListProps {
  sections: ChatSectionData[];
  /** Shown on the Groups tab. */
  groupSections?: ChatSectionData[];
  /** Shown on the Announcements tab. */
  announcementSections?: ChatSectionData[];
  defaultTab?: ChatTab;
  /** Shown instead of the chats, e.g. when they couldn't be loaded. */
  error?: string;
}

type ChatTab = "chats" | "groups" | "announcements";
const TABS: { id: ChatTab; label: string }[] = [
  { id: "chats", label: "Chats" },
  { id: "groups", label: "Groups" },
  { id: "announcements", label: "Announcements" },
];
const EMPTY: Record<ChatTab, string> = {
  chats: "No chats yet",
  groups: "No groups yet",
  announcements: "No announcements yet",
};

function ChatAvatar({ avatar }: { avatar: ChatAvatarData | [ChatAvatarData, ChatAvatarData] }) {
  return Array.isArray(avatar) ? (
    <AvatarPair first={avatar[0]} second={avatar[1]} />
  ) : (
    <Avatar {...avatar} />
  );
}

export function ChatList({
  sections,
  groupSections = [],
  announcementSections = [],
  defaultTab = "chats",
  error,
}: ChatListProps) {
  const [tab, setTab] = useState<ChatTab>(defaultTab);
  const shown =
    tab === "chats" ? sections : tab === "groups" ? groupSections : announcementSections;
  const empty = error ?? (shown.every((s) => s.chats.length === 0) ? EMPTY[tab] : undefined);
  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto py-5 md:border-r md:border-divider">
      <div className="flex h-7.75 shrink-0 items-center gap-2 px-5">
        {TABS.map((t) => (
          <Chip key={t.id} selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {empty ? (
        <div className="flex flex-1 items-center justify-center px-5">
          <EmptyState icon="direct-normal" message={empty} />
        </div>
      ) : (
        shown.map((section) => (
          <Fragment key={section.title}>
            <Separator />
            <ChatSection title={section.title} arrow={section.arrow} collapsed={section.collapsed}>
              {section.chats.map(({ id, avatar, ...chat }) => (
                <ChatListItem
                  key={id}
                  {...chat}
                  avatar={<ChatAvatar avatar={avatar} />}
                  group={Array.isArray(avatar)}
                />
              ))}
            </ChatSection>
          </Fragment>
        ))
      )}
    </div>
  );
}
