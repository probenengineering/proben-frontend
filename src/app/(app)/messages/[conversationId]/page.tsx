import type { Metadata } from "next";
import { Suspense } from "react";

import { InboxHeader } from "@/components/organisms";
import { ChatTemplate, InboxTemplate } from "@/components/templates";
import { parseFilters } from "@/lib/messaging/filters";
import { loadChat } from "@/lib/messaging/inbox";

export const metadata: Metadata = {
  title: "Messages | Proben",
};

type Props = PageProps<"/messages/[conversationId]">;

// The header shows straight away; the chat list and conversation stream in once loaded.
export default function ChatPage(props: Props) {
  return (
    <Suspense fallback={<InboxTemplate header={<InboxHeader />} list={null} />}>
      <Chat params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Chat({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const filters = parseFilters(await searchParams);
  const screen = await loadChat((await params).conversationId, filters);
  return <ChatTemplate screen={screen} />;
}
