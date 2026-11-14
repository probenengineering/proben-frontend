import type { ReactNode } from "react";

import { AppSidebar } from "@/components/organisms";

// Layout for app pages: grey page, sidebar on the left (272px, or 82px collapsed), content in a
// white card with 32px corners and 10px margins top, bottom and right (Figma 1440x960 chat frames).
// Below lg the sidebar moves into a ☰ drawer (in the page header). Phones: the card fills the
// screen edge to edge; tablets keep the grey 10px margin and rounded card.
export interface AppShellProps {
  children: ReactNode;
  /** Icons-only sidebar (kept for later; chats currently use the full sidebar). */
  sidebarCollapsed?: boolean;
  /** Sidebar item to highlight, e.g. "home". */
  activeNav?: "home";
}

export function AppShell({ children, sidebarCollapsed, activeNav }: AppShellProps) {
  return (
    <div className="flex h-dvh w-full bg-surface md:p-2.5 lg:py-0 lg:pr-2.5 lg:pl-0">
      <div className="hidden h-full lg:block">
        <AppSidebar collapsed={sidebarCollapsed} activeItem={activeNav} />
      </div>
      <div className="flex min-w-0 flex-1 lg:py-2.5">
        <main className="flex h-full w-full flex-col overflow-clip bg-white md:rounded-[32px]">
          {children}
        </main>
      </div>
    </div>
  );
}
