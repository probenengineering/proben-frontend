import type { AvatarProps, IconName } from "@/components/atoms";
import type { DashboardTab } from "@/components/organisms";

// Sample home-dashboard data copied from the Figma frame, until real data is wired up.

export const DASHBOARD_TABS: DashboardTab[] = [
  { label: "Overview", href: "/" },
  { label: "Today’s Schedule", href: "/schedule" },
  { label: "My Tasks", href: "/tasks" },
  { label: "My Homes", href: "/homes" },
];

export const QUICK_ACTIONS: { icon: IconName; label: string; href?: string }[] = [
  { icon: "calendar-2", label: "Request time off" },
  { icon: "document-text-16", label: "View my documents" },
  { icon: "message", label: "Read my messages", href: "/messages" },
  { icon: "menu-board", label: "Pick up open shift" },
  { icon: "setting-2-16", label: "Profile settings" },
];

export const DOCK_AVATARS: Pick<AvatarProps, "src" | "color">[] = [
  { src: "/images/avatar-sample.png", color: "pink" },
  { src: "/images/team-avatar-2.png" },
  { src: "/images/team-kristin.png" },
];
