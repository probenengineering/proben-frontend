import type { Metadata } from "next";

import { ChatTemplate } from "@/components/templates";
import { parseFilters } from "@/lib/messaging/filters";
import { loadChat } from "@/lib/messaging/inbox";

// Moving between chats waits for the next chat on the server, keeping the current one on screen
// instead of flashing a loading state (the messages layout covers the first visit).
export const instant = false;

export const metadata: Metadata = {
  title: "Messages | Proben",
};

type Props = PageProps<"/messages/[conversationId]">;

// One chat open (the messages layout shows the loading state on a first visit; moving between
// chats keeps the current one on screen until the next is ready).
export default async function ChatPage({ params, searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const screen = await loadChat((await params).conversationId, filters);
  return <ChatTemplate screen={screen} />;
}
