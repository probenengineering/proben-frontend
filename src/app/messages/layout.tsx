import type { ReactNode } from "react";

import { AppShell } from "@/components/templates";
import { RealtimeProvider } from "@/lib/realtime";

// Shared by the inbox and every chat: the app shell stays put and one live connection stays open
// while moving between chats. Pages stream their data in (signed out → /sign-in).
export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <RealtimeProvider>
      <AppShell>{children}</AppShell>
    </RealtimeProvider>
  );
}
