"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { Icon, type IconName, LinkPendingTint } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma component "Sidebar / menu item". Active item: medium grey-900 label on a white-500
// background, or peach (avatar-orange, Figma "Primary/50") with activeTone="peach".
// collapsed: icon only, centred (collapsed 82px sidebar); the label becomes the accessible name.
// href: renders the item as a link (e.g. Messages → /messages); it tints while its page loads.
// activePaths: the item is active while the URL is one of these paths or below it ("/" matches
// only the home page itself), so the current route is always highlighted.
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
  /** Routes that make this item active, e.g. ["/messages"]. */
  activePaths?: string[];
}

function matches(pathname: string, path: string) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

// Reading the URL suspends on routes with an unknown dynamic param (e.g. /staff/[id]) under Cache
// Components, so the URL-aware item sits in <Suspense> with the same item, not highlighted, as
// the fallback (Next docs: use-pathname "Cache Components"). Client navigations never show it.
export function SidebarMenuItem(props: SidebarMenuItemProps) {
  if (!props.activePaths) return <ItemView {...props} isActive={!!props.active} />;
  return (
    <Suspense fallback={<ItemView {...props} isActive={!!props.active} />}>
      <RouteAwareItem {...props} />
    </Suspense>
  );
}

function RouteAwareItem(props: SidebarMenuItemProps) {
  const pathname = usePathname();
  const isActive =
    !!props.active || (props.activePaths?.some((path) => matches(pathname, path)) ?? false);
  return <ItemView {...props} isActive={isActive} />;
}

function ItemView({
  icon,
  label,
  activeTone = "grey",
  badge,
  trailing,
  collapsed,
  href,
  isActive,
}: SidebarMenuItemProps & { isActive: boolean }) {
  const className = cn(
    // Figma radius 4px; no radius token yet.
    // Hover: the white-500 fill of the grey active state (no Figma hover frame).
    "flex w-full cursor-pointer items-center gap-1 overflow-clip rounded-[4px] px-4 py-3 transition-colors duration-150",
    collapsed && "justify-center",
    isActive
      ? activeTone === "peach"
        ? "border border-avatar-orange bg-avatar-orange"
        : "bg-white-500"
      : "hover:bg-white-500",
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
              isActive ? "font-medium text-grey-900" : "text-grey-700",
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
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      className={cn("relative isolate", className)}
    >
      {!isActive && <LinkPendingTint />}
      {content}
    </Link>
  ) : (
    <div aria-label={ariaLabel} className={className}>
      {content}
    </div>
  );
}
