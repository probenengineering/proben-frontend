import { connection } from "next/server";

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
  // Request-time data: without this, the phone menu's copy of the sidebar (rendered inside each
  // page's header) is treated as prerenderable and the API call trips Next's Date.now() check.
  await connection();
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
      activePaths={["/messages"]}
      activeTone="peach"
      badge={count > 0 ? (count > 99 ? "99+" : String(count)) : undefined}
      collapsed={collapsed}
    />
  );
}
