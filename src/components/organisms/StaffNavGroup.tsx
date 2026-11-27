"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

import { Icon } from "@/components/atoms";
import { SidebarMenuItem, SidebarSubMenuItem } from "@/components/molecules";
import { cn } from "@/lib/utils";

// Sidebar "Staff management" group (Figma 103:18356): the item with a chevron, and below it
// (8px padding, 2px gaps) All staff, Roles & permissions, Home assignments and Staff tasks. The
// open group's label is Inter Medium grey-900; the current page's sub-item is peach. It starts
// open on /staff pages and the chevron toggles it. Collapsed sidebar: just the icon, linking to
// All staff.
export interface StaffNavGroupProps {
  collapsed?: boolean;
  /** Which sub-pages the signed-in person may open (lib/auth/access); the rest aren't listed. */
  show: { allStaff: boolean; roles: boolean; homes: boolean; tasks: boolean };
}

const under = (path: string, base: string) => path === base || path.startsWith(`${base}/`);
const isRolePage = (path: string) => /^\/staff\/[^/]+\/role$/.test(path);
const isRolesPage = (path: string) => under(path, "/staff/roles") || isRolePage(path);
const isHomesPage = (path: string) => under(path, "/staff/homes");
const isTasksPage = (path: string) => under(path, "/staff/tasks");

const SUB_ITEMS = [
  {
    key: "allStaff",
    label: "All staff",
    href: "/staff",
    isCurrent: (path: string) =>
      under(path, "/staff") && !isRolesPage(path) && !isHomesPage(path) && !isTasksPage(path),
  },
  // Also current on a person's Assign role page (103:19418).
  { key: "roles", label: "Roles & permissions", href: "/staff/roles", isCurrent: isRolesPage },
  { key: "homes", label: "Home assignments", href: "/staff/homes", isCurrent: isHomesPage },
  { key: "tasks", label: "Staff tasks", href: "/staff/tasks", isCurrent: isTasksPage },
] as const;

// The URL read sits in <Suspense> (see SidebarMenuItem); the fallback is the closed group.
export function StaffNavGroup(props: StaffNavGroupProps) {
  return (
    <Suspense fallback={<GroupView {...props} inStaff={false} />}>
      <RouteAwareGroup {...props} />
    </Suspense>
  );
}

function RouteAwareGroup(props: StaffNavGroupProps) {
  return <GroupView {...props} inStaff={usePathname().startsWith("/staff")} />;
}

function GroupView({ collapsed, show, inStaff }: StaffNavGroupProps & { inStaff: boolean }) {
  const [open, setOpen] = useState(inStaff);
  const items = SUB_ITEMS.filter((item) => show[item.key]);
  if (items.length === 0) return null;

  if (collapsed) {
    return (
      <SidebarMenuItem
        icon="people"
        label="Staff management"
        href={items[0].href}
        activePaths={["/staff"]}
        activeTone="peach"
        collapsed
      />
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 rounded-[4px] px-4 py-3 text-left transition-colors duration-150 hover:bg-white-500"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <Icon name="people" />
          <span
            className={cn(
              "type-paragraph-sm",
              open || inStaff ? "font-medium text-grey-900" : "text-grey-700",
            )}
          >
            Staff management
          </span>
        </span>
        <Icon name={open ? "chevron-up" : "chevron-down"} />
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 py-2">
          {items.map(({ key, ...item }) => (
            <SidebarSubMenuItem key={key} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
