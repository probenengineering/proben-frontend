import { MessagesDock } from "@/components/molecules";
import { loadRecentContacts } from "@/lib/messaging/recent";

// The dashboard's "Messages" pill with the avatars of the last three people you messaged
// (initials, as the API has no photos yet). Loaded with the page, so the avatars don't pop in;
// signed out or on a load failure, the pill shows without avatars.
export async function RecentChatsDock() {
  const people = await loadRecentContacts(3);
  return (
    <MessagesDock avatars={people.map((person) => ({ ...person.avatar, alt: person.name }))} />
  );
}
