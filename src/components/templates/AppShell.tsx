import type { ReactNode } from "react";

import { Appear } from "@/components/atoms";
import { AppSidebar, GlobalSearch } from "@/components/organisms";
import { cn } from "@/lib/utils";

// Layout for app pages: grey page, sidebar on the left (272px, or 82px collapsed), content in a
// white card with 32px corners and 10px margins top, bottom and right (Figma 1440x960 chat frames).
// md–lg (tablets, narrow windows) shows the 82px icons-only sidebar; below md it moves into a ☰
// drawer (in the page header). Phones: the card fills the screen edge to edge; tablets keep the
// grey 10px margin and rounded card.
export interface AppShellProps {
  children: ReactNode;
  /** Icons-only sidebar (kept for later; chats currently use the full sidebar). */
  sidebarCollapsed?: boolean;
  /** Sidebar item to highlight, e.g. "home". */
  activeNav?: "home" | "notifications";
  /**
   * "flat" (My Homes frames, 51:12496): white sidebar with a search field, white-300 page and
   * no rounded white card around the content.
   */
  variant?: "card" | "flat";
}

export function AppShell({
  children,
  sidebarCollapsed,
  activeNav,
  variant = "card",
}: AppShellProps) {
  const flat = variant === "flat";
  return (
    <div
      className={cn("flex h-dvh w-full", flat ? "bg-white-300" : "bg-surface md:py-2.5 md:pr-2.5")}
    >
      <div className="hidden h-full lg:block">
        <AppSidebar
          collapsed={sidebarCollapsed}
          activeItem={activeNav}
          tone={flat ? "white" : "grey"}
          search={flat}
        />
      </div>
      {/* Tablets and narrow laptop windows: the icons-only sidebar, so navigation stays visible. */}
      <div className="hidden h-full md:block lg:hidden">
        <AppSidebar collapsed activeItem={activeNav} tone={flat ? "white" : "grey"} />
      </div>
      <div className="flex min-w-0 flex-1">
        <main
          className={cn(
            "flex h-full w-full flex-col overflow-clip",
            !flat && "bg-white md:rounded-[32px]",
          )}
        >
          {/* Fades the page in on navigation; the sidebar stays still. */}
          <Appear className="flex min-h-0 w-full flex-1 flex-col">{children}</Appear>
        </main>
        {/* ⌘K / the header search box open the global search (Figma 60:14989). */}
        <GlobalSearch />
      </div>
    </div>
  );
}
