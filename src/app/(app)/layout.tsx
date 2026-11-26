import { Suspense } from "react";

import { ContentSkeleton } from "@/components/organisms";
import { AppShell } from "@/components/templates";

// Every signed-in app page shares this shell, so the sidebar (user card, unread count) stays
// mounted while moving between pages. The one loading boundary sits here, above the pages: it
// shows on a first visit only. Moving between pages keeps the current one on screen (with the
// progress bar) until the next is ready, so nothing clears or flashes a skeleton in between.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell>
      <Suspense fallback={<ContentSkeleton label="Loading" rows={5} />}>{children}</Suspense>
    </AppShell>
  );
}
