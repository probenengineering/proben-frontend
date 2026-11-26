import type { ReactNode } from "react";

import { RealtimeProvider } from "@/lib/realtime";

// Shared by the inbox and every chat: one live connection stays open while moving between chats
// (the app shell comes from the (app) layout). Pages stream their data in.
export default function MessagesLayout({ children }: { children: ReactNode }) {
  return <RealtimeProvider>{children}</RealtimeProvider>;
}
