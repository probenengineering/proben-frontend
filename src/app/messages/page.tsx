import type { Metadata } from "next";
import { Suspense } from "react";

import { ChatList, InboxHeader } from "@/components/organisms";
import { InboxTemplate } from "@/components/templates";
import { parseFilters } from "@/lib/messaging/filters";
import { loadInbox } from "@/lib/messaging/inbox";

export const metadata: Metadata = {
  title: "Messages | Proben",
};

// The header shows straight away; the chat list streams in once loaded.
// Search, filters and ordering come from the URL (?q=&type=…, see lib/messaging/filters).
export default function MessagesPage(props: PageProps<"/messages">) {
  return (
    <Suspense fallback={<InboxTemplate header={<InboxHeader />} list={null} />}>
      <Inbox searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Inbox({ searchParams }: Pick<PageProps<"/messages">, "searchParams">) {
  const inbox = await loadInbox(parseFilters(await searchParams));
  return (
    <InboxTemplate
      header={<InboxHeader filters={inbox.filters} catalog={inbox.catalog} />}
      list={
        <ChatList
          sections={inbox.sections}
          groupSections={inbox.groupSections}
          announcementSections={inbox.announcementSections}
          error={inbox.error}
        />
      }
    />
  );
}
