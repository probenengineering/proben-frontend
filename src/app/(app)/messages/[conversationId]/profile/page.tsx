import type { Metadata } from "next";
import { Suspense } from "react";

import { InboxHeader, ProfilePanel } from "@/components/organisms";
import { ChatTemplate, InboxTemplate } from "@/components/templates";
import { parseFilters } from "@/lib/messaging/filters";
import { loadChat } from "@/lib/messaging/inbox";
import { initialsOf } from "@/lib/messaging/mappers";
import { loadProfile } from "@/lib/messaging/profile";

export const metadata: Metadata = {
  title: "Profile | Messages | Proben",
};

type Props = PageProps<"/messages/[conversationId]/profile">;

// A chat with the other person's profile beside it (Figma 13:51414).
export default function ChatProfilePage(props: Props) {
  return (
    <Suspense fallback={<InboxTemplate header={<InboxHeader />} list={null} />}>
      <ChatWithProfile params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ChatWithProfile({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const filters = parseFilters(await searchParams);
  const screen = await loadChat((await params).conversationId, filters);
  const profile = await loadProfile(screen.conversation, screen.me.id, screen.title);
  return (
    <ChatTemplate
      screen={screen}
      aside={
        <ProfilePanel
          conversationId={screen.conversation.id}
          closeHref={`/messages/${screen.conversation.id}`}
          initials={initialsOf(profile.name)}
          {...profile}
        />
      }
    />
  );
}
