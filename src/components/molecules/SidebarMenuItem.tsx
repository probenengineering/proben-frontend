import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma component "Sidebar / menu item". Active item: medium grey-900 label on a white-500
// background, or peach (avatar-orange, Figma "Primary/50") with activeTone="peach" (Home/Tasks).
// collapsed: icon only, centred (collapsed 82px sidebar); the label becomes the accessible name.
// href: renders the item as a link (e.g. Messages → /messages).
// activeFor: highlights the item whenever the page carries a matching `data-nav` marker (set by
// the page's template), with CSS only, so the sidebar can stay mounted in the shared layout.
export interface SidebarMenuItemProps {
  icon: IconName;
  label: string;
  active?: boolean;
  activeTone?: "grey" | "peach";
  /** Small count pill on the right, e.g. "10". */
  badge?: string;
  /** Extra content on the right, e.g. a chevron. */
  trailing?: ReactNode;
  collapsed?: boolean;
  /** Makes the item a link, e.g. "/messages". */
  href?: string;
  /** Active when the page has `data-nav="<value>"` (peach style). */
  activeFor?: "home" | "notifications";
}

// Literal class names so Tailwind generates them. `in-[…]` also reaches the ☰ drawer (a portal).
const ACTIVE_FOR = {
  home: {
    item: "in-[body:has([data-nav=home])]:border in-[body:has([data-nav=home])]:border-avatar-orange in-[body:has([data-nav=home])]:bg-avatar-orange",
    label:
      "in-[body:has([data-nav=home])]:font-medium in-[body:has([data-nav=home])]:text-grey-900",
  },
  notifications: {
    item: "in-[body:has([data-nav=notifications])]:border in-[body:has([data-nav=notifications])]:border-avatar-orange in-[body:has([data-nav=notifications])]:bg-avatar-orange",
    label:
      "in-[body:has([data-nav=notifications])]:font-medium in-[body:has([data-nav=notifications])]:text-grey-900",
  },
} as const;

export function SidebarMenuItem({
  icon,
  label,
  active,
  activeTone = "grey",
  badge,
  trailing,
  collapsed,
  href,
  activeFor,
}: SidebarMenuItemProps) {
  const className = cn(
    // Figma radius 4px; no radius token yet.
    "flex w-full items-center gap-1 overflow-clip rounded-[4px] px-4 py-3",
    collapsed && "justify-center",
    active &&
      (activeTone === "peach" ? "border border-avatar-orange bg-avatar-orange" : "bg-white-500"),
    activeFor && ACTIVE_FOR[activeFor].item,
  );
  const ariaLabel = collapsed ? label : undefined;

  const content = (
    <>
      <div className={cn("flex min-w-0 flex-1 items-center gap-3", collapsed && "justify-center")}>
        <Icon name={icon} />
        {!collapsed && (
          <span
            className={cn(
              "type-paragraph-sm",
              active ? "font-medium text-grey-900" : "text-grey-700",
              activeFor && ACTIVE_FOR[activeFor].label,
            )}
          >
            {label}
          </span>
        )}
      </div>
      {!collapsed && badge && (
        // Figma "Paragraph/XSmall/Medium" has -0.5% letter spacing; the paragraph-xs token has 0.
        <span className="rounded-[10px] bg-grey-100 px-2 type-paragraph-xs font-medium tracking-[-0.005em] text-grey-700">
          {badge}
        </span>
      )}
      {!collapsed && trailing}
    </>
  );

  return href ? (
    <Link href={href} aria-label={ariaLabel} className={className}>
      {content}
    </Link>
  ) : (
    <div aria-label={ariaLabel} className={className}>
      {content}
    </div>
  );
}
