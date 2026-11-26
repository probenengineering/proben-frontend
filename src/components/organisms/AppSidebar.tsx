import { Suspense } from "react";

import { Icon, Input, Logo } from "@/components/atoms";
import { SidebarMenuItem, UserCard } from "@/components/molecules";
import { cn } from "@/lib/utils";

import { CurrentUserCard } from "./CurrentUserCard";
import { MessagesMenuItem } from "./MessagesMenuItem";

// Figma component "Sidebar": 272px with labels, or 82px icons-only when collapsed (chat open).
// No item is highlighted, matching the chat frames. Items aren't links yet.
export interface AppSidebarProps {
  collapsed?: boolean;
  /** Highlights a main item with the peach active style (Figma: Home on the Tasks screens). */
  activeItem?: "home" | "notifications";
  /** "white" = white background (My Homes frames); default grey (sits on the page). */
  tone?: "grey" | "white";
  /** Search field under the logo (My Homes frames). Not wired to anything yet. */
  search?: boolean;
}

export function AppSidebar({ collapsed, activeItem, tone = "grey", search }: AppSidebarProps) {
  const item = { collapsed };
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col justify-between overflow-clip rounded-[12px] py-6",
        collapsed ? "w-20.5" : "w-68",
        tone === "white" && "bg-white",
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center px-6 py-2">
          <Logo variant={collapsed ? "compact" : "full"} />
        </div>
        <div className="flex flex-col gap-5">
          {search && !collapsed && (
            <div className="px-4">
              {/* Figma: 36px, grey-300 border, 6px radius, 20px icon, grey-400 placeholder. */}
              <Input
                aria-label="Search"
                placeholder="Search"
                iconLeft={<Icon name="search" />}
                frameClassName="h-9 gap-2 rounded-[6px] border-grey-300 px-3 py-2"
              />
            </div>
          )}
          <nav className="flex flex-col gap-3 px-2">
            <div className="flex flex-col gap-1">
              <SidebarMenuItem
                icon="home"
                label="Home"
                href="/"
                active={activeItem === "home"}
                activeTone="peach"
                {...item}
              />
              <Suspense
                fallback={
                  <SidebarMenuItem icon="messages" label="Messages" href="/messages" {...item} />
                }
              >
                <MessagesMenuItem {...item} />
              </Suspense>
              <SidebarMenuItem
                icon="grid"
                label="Staffer"
                trailing={<Icon name="chevron-down" />}
                {...item}
              />
              <SidebarMenuItem
                icon="notification"
                label="Notifications"
                href="/notifications"
                active={activeItem === "notifications"}
                activeTone="peach"
                {...item}
              />
              <SidebarMenuItem icon="user" label="Profile" {...item} />
            </div>
            <div className="h-px w-full bg-grey-100" />
          </nav>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-3 px-2 pb-3">
          {!collapsed && (
            <p className="pr-4 pl-3 type-paragraph-sm font-medium text-grey-400">Settings</p>
          )}
          <div className="flex flex-col gap-1">
            <SidebarMenuItem icon="unlock" label="Help & privacy" {...item} />
            <SidebarMenuItem icon="setting-2" label="Settings" {...item} />
          </div>
        </div>
        <div className="py-2">
          {/* The signed-in person streams in; an empty card holds the space meanwhile. */}
          <Suspense fallback={<UserCard name="" signedIn={false} compact={collapsed} />}>
            <CurrentUserCard compact={collapsed} />
          </Suspense>
        </div>
      </div>
    </aside>
  );
}
