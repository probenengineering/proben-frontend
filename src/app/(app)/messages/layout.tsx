import type { ReactNode } from "react";

import { RealtimeProvider } from "@/lib/realtime";

// Shared by the inbox and every chat: one live connection stays open while moving between chats
// (the app shell and the first-visit loading state come from the (app) layout). The pages wait
// for their data, so opening another chat keeps the current one on screen until it's ready.
export default function MessagesLayout({ children }: { children: ReactNode }) {
  return <RealtimeProvider>{children}</RealtimeProvider>;
}
