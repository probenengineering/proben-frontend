"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

// Figma "Sidebar / sub-menu item" (Staff management group, 103:18356): 48px left / 16px right
// padding, 12px vertical, 4px radius (no radius token yet), Inter 14 (paragraph-sm) grey-600.
// Current page: peach fill (avatar-orange, Figma "Primary/50") and grey-900 text. Hover: white-500.
// No href: shown but not a link yet (its screen isn't designed).
export interface SidebarSubMenuItemProps {
  label: string;
  href?: string;
  /** Overrides "current" matching, e.g. Roles & permissions on /staff/[id]/role. */
  isCurrent?: (pathname: string) => boolean;
}

// The URL read sits in <Suspense> (see SidebarMenuItem): fallback = the same item, not current.
export function SidebarSubMenuItem(props: SidebarSubMenuItemProps) {
  if (!props.href && !props.isCurrent) return <SubItemView {...props} active={false} />;
  return (
    <Suspense fallback={<SubItemView {...props} active={false} />}>
      <RouteAwareSubItem {...props} />
    </Suspense>
  );
}

function RouteAwareSubItem(props: SidebarSubMenuItemProps) {
  const pathname = usePathname();
  const href = props.href ?? "";
  const active = props.isCurrent
    ? props.isCurrent(pathname)
    : pathname === href || pathname.startsWith(`${href}/`);
  return <SubItemView {...props} active={active} />;
}

function SubItemView({ label, href, active }: SidebarSubMenuItemProps & { active: boolean }) {
  const className = cn(
    "flex w-full items-center rounded-[4px] py-3 pr-4 pl-12 type-paragraph-sm transition-colors duration-150",
    active ? "bg-avatar-orange text-grey-900" : "text-grey-600 hover:bg-white-500",
  );
  return href ? (
    <Link href={href} aria-current={active ? "page" : undefined} className={className}>
      {label}
    </Link>
  ) : (
    <div className={className}>{label}</div>
  );
}
