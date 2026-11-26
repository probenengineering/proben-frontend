import Link from "next/link";
import { Suspense } from "react";

import { Icon } from "@/components/atoms";

import { CurrentUserBadge } from "./CurrentUserBadge";
import { GlobalSearchTrigger } from "./GlobalSearchTrigger";
import { MobileNav } from "./MobileNav";
import { UserGreeting } from "./UserGreeting";

// Figma: dashboard title bar (87px, white-400 bottom border). Greeting 40px from the left,
// search centred in the card, bell + divider + role tag + avatar 40px from the right.
// Below lg (agreed): ☰ + greeting + bell on one row, full-width search underneath.
export interface DashboardHeaderProps {
  /** Fixed title; leave out for "Good morning, <first name>". */
  greeting?: string;
  /** 320px search box (My Homes frames) instead of 241px. */
  wideSearch?: boolean;
}

export function DashboardHeader({ greeting, wideSearch }: DashboardHeaderProps) {
  return (
    <header className="relative flex w-full shrink-0 flex-col border-b border-white-400 lg:h-21.75 lg:flex-row lg:items-center lg:justify-between lg:px-10">
      <div className="flex h-16 items-center justify-between px-5 lg:h-auto lg:px-0">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav className="md:hidden" />
          <h1 className="truncate type-title-lg font-medium text-black">
            {greeting ?? (
              <Suspense fallback="Hello">
                <UserGreeting />
              </Suspense>
            )}
          </h1>
        </div>
        <Link href="/notifications" aria-label="Notifications" className="lg:hidden">
          <Icon name="notification-bing" />
        </Link>
      </div>

      <div className="px-5 pb-4 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:p-0">
        <GlobalSearchTrigger className={wideSearch ? "w-full lg:w-80" : "w-full lg:w-60.25"} />
      </div>

      <div className="hidden items-center gap-5 lg:flex">
        <Link href="/notifications" aria-label="Notifications">
          <Icon name="notification-bing" />
        </Link>
        <span className="h-3 w-0.5 bg-white-700" />
        <CurrentUserBadge />
      </div>
    </header>
  );
}
