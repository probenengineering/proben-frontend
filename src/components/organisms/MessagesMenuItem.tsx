import { SidebarMenuItem } from "@/components/molecules";
import { getAccessToken } from "@/lib/auth/session";
import { messaging } from "@/lib/messaging/api";

// The sidebar's Messages item with the unread-message count pill
// (GET /api/messaging/unread-count). Reads the session, so render it inside <Suspense>.
// No pill when signed out, at zero, or if the count can't load.
export interface MessagesMenuItemProps {
  collapsed?: boolean;
}

export async function MessagesMenuItem({ collapsed }: MessagesMenuItemProps) {
  const count = (await getAccessToken())
    ? await messaging<{ messages: number }>("/unread-count")
        .then((r) => r.messages)
        .catch(() => 0)
    : 0;
  return (
    <SidebarMenuItem
      icon="messages"
      label="Messages"
      href="/messages"
      badge={count > 0 ? (count > 99 ? "99+" : String(count)) : undefined}
      collapsed={collapsed}
    />
  );
}
