import { Suspense } from "react";

import { ContentSkeleton } from "@/components/organisms";
import { AppShell } from "@/components/templates";
import { RealtimeProvider } from "@/lib/realtime";

// Every signed-in app page shares this shell, so the sidebar (user card, unread count) and the
// live connection (new messages, notification sounds) stay up while moving between pages. The one
// loading boundary sits here, above the pages: it shows on a first visit only. Moving between pages
// keeps the current one on screen (with the progress bar) until the next is ready.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <RealtimeProvider>
      <AppShell>
        <Suspense fallback={<ContentSkeleton label="Loading" rows={5} />}>{children}</Suspense>
      </AppShell>
    </RealtimeProvider>
  );
}
