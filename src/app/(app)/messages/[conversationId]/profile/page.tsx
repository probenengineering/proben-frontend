import type { Metadata } from "next";

import { ProfilePanel } from "@/components/organisms";
import { ChatTemplate } from "@/components/templates";
import { parseFilters } from "@/lib/messaging/filters";
import { loadChat } from "@/lib/messaging/inbox";
import { initialsOf } from "@/lib/messaging/mappers";
import { loadProfile } from "@/lib/messaging/profile";
import { requireAccess } from "@/lib/auth/guard";

// Moving between chats waits for the next chat on the server, keeping the current one on screen
// instead of flashing a loading state (the messages layout covers the first visit).
export const instant = false;

export const metadata: Metadata = {
  title: "Profile | Messages | Proben",
};

type Props = PageProps<"/messages/[conversationId]/profile">;

// A chat with the other person's profile beside it (Figma 13:51414).
export default async function ChatProfilePage({ params, searchParams }: Props) {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("messages");
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
