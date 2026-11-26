import type { ReactNode } from "react";

import { ChatList, Conversation, InboxHeader, MessageThread } from "@/components/organisms";
import { ChatProvider } from "@/lib/chat-store";
import type { ChatScreen } from "@/lib/messaging/inbox";
import { avatarFor } from "@/lib/messaging/mappers";

import { InboxTemplate } from "./InboxTemplate";

// Inbox with one chat open (Figma "Chat" frames): chat list, the conversation, and an optional
// panel beside it (the profile). Group chats have no profile panel design yet, so "more" stays put.
// Goes inside <AppShell> (the /messages layout).
export interface ChatTemplateProps {
  screen: ChatScreen;
  aside?: ReactNode;
}

export function ChatTemplate({ screen, aside }: ChatTemplateProps) {
  const { conversation, me, title } = screen;
  const href = `/messages/${conversation.id}`;
  const other = conversation.participants.find((id) => id !== me.id);
  return (
    <ChatProvider
      conversationId={conversation.id}
      meId={me.id}
      initialPage={screen.page}
      names={screen.names}
      targets={screen.targets}
      maxLength={screen.settings?.maxMessageLength}
    >
      <InboxTemplate
        header={<InboxHeader filters={screen.filters} catalog={screen.catalog} />}
        list={
          <ChatList
            sections={screen.sections}
            groupSections={screen.groupSections}
            announcementSections={screen.announcementSections}
            defaultTab={conversation.type === "group" ? "groups" : "chats"}
            error={screen.error}
          />
        }
        detail={
          <Conversation
            name={title}
            avatar={avatarFor(conversation.type === "direct" ? other : conversation.id, title)}
            profileHref={conversation.type === "direct" ? `${href}/profile` : href}
            canAttach={screen.can.attach}
          >
            <MessageThread />
          </Conversation>
        }
        aside={aside}
      />
    </ChatProvider>
  );
}
