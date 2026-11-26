import { type ReactNode, Suspense } from "react";

import { AppSidebar, GlobalSearch, NavigationProgress } from "@/components/organisms";

// Layout for app pages, rendered once by src/app/(app)/layout.tsx so the sidebar, its user card
// and unread count stay mounted while pages change: grey page, sidebar on the left (272px, or
// 82px collapsed), content in a white card with 32px corners and 10px margins top, bottom and
// right (Figma 1440x960 chat frames). md–lg (tablets, narrow windows) shows the 82px icons-only
// sidebar; below md it moves into a ☰ drawer (in the page header). Phones: the card fills the
// screen edge to edge; tablets keep the grey 10px margin and rounded card. "Flat" (Notifications
// frames, when the page carries `data-shell="flat"`): white sidebar with a search field, white-300
// page and no rounded card. CSS :has() picks the style, so the shell never reads the URL.
export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="group/shell flex h-dvh w-full bg-surface has-[[data-shell=flat]]:bg-white-300 md:py-2.5 md:pr-2.5 has-[[data-shell=flat]]:md:p-0">
      <div className="hidden h-full lg:block">
        <AppSidebar />
      </div>
      {/* Tablets and narrow laptop windows: the icons-only sidebar, so navigation stays visible. */}
      <div className="hidden h-full md:block lg:hidden">
        <AppSidebar collapsed />
      </div>
      <div className="flex min-w-0 flex-1">
        <main className="relative flex h-full w-full flex-col overflow-clip bg-white group-has-[[data-shell=flat]]/shell:bg-transparent md:rounded-[32px] group-has-[[data-shell=flat]]/shell:md:rounded-none">
          {/* Reads the URL, so it sits in its own boundary (renders nothing until hydrated). */}
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </main>
        {/* ⌘K / the header search box open the global search (Figma 60:14989). */}
        <GlobalSearch />
      </div>
    </div>
  );
}
