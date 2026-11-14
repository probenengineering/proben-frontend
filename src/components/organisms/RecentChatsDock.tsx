import { Suspense } from "react";

import { MessagesDock } from "@/components/molecules";
import { loadRecentContacts } from "@/lib/messaging/recent";

// The dashboard's "Messages" pill with the avatars of the last three people you messaged
// (initials, as the API has no photos yet). Streams in; until then, or when signed out, the pill
// shows without avatars.
async function DockWithContacts() {
  const people = await loadRecentContacts(3);
  return (
    <MessagesDock avatars={people.map((person) => ({ ...person.avatar, alt: person.name }))} />
  );
}

export function RecentChatsDock() {
  return (
    <Suspense fallback={<MessagesDock avatars={[]} />}>
      <DockWithContacts />
    </Suspense>
  );
}
