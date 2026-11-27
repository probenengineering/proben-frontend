import type { Metadata } from "next";

import { ChatList, InboxHeader } from "@/components/organisms";
import { InboxTemplate } from "@/components/templates";
import { parseFilters } from "@/lib/messaging/filters";
import { loadInbox } from "@/lib/messaging/inbox";
import { requireAccess } from "@/lib/auth/guard";

// Moving between chats waits for the next chat on the server, keeping the current one on screen
// instead of flashing a loading state (the messages layout covers the first visit).
export const instant = false;

export const metadata: Metadata = {
  title: "Messages | Proben",
};

// The chat list, loaded on the server (the messages layout shows the loading state). Search,
// filters and ordering come from the URL (?q=&type=…, see lib/messaging/filters).
export default async function MessagesPage({ searchParams }: PageProps<"/messages">) {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("messages");
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
