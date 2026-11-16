import type { AvatarProps, IconName } from "@/components/atoms";
import type { OpenShiftItemProps, ScheduleItemProps } from "@/components/molecules";
import type { DashboardTab } from "@/components/organisms";
import type { ScheduledShift } from "@/lib/shift-clock/types";

// Sample home-dashboard data copied from the Figma frame, until real data is wired up.

export const DASHBOARD_TABS: DashboardTab[] = [
  { label: "Overview", href: "/" },
  { label: "Today’s Schedule" },
  { label: "My Tasks", href: "/tasks" },
  { label: "My Homes", href: "/homes" },
];

/** The shift the "My time" clock runs against (Figma: 8:00 AM – 4:00 PM, 0h 30m break). */
export const SHIFT: ScheduledShift = {
  label: "8:00 AM – 4:00 PM",
  durationMinutes: 8 * 60,
  breakAllowanceMinutes: 30,
};

export const SCHEDULE: Omit<ScheduleItemProps, "first">[] = [
  {
    start: "8:00 AM",
    end: "4:00 PM",
    home: "Oakridge Group Home",
    role: "Direct Support Professional",
    address: "123 Oakridge Ave, Madison, WI",
    active: true,
  },
  {
    start: "8:00 AM",
    end: "4:00 PM",
    home: "Becharbum Group Home",
    role: "Day Care",
    address: "123 Madelan Road, Madison, WIII",
    addressIcon: "video-16",
  },
];

export const OPEN_SHIFTS: OpenShiftItemProps[] = [
  {
    date: "Wed, Apr 30",
    hours: "7:00 AM - 3: 00 PM",
    home: "Oakridge Group Home",
    address: "123 Oakridge Ave, Madison, WI",
  },
];

export const QUICK_ACTIONS: { icon: IconName; label: string; href?: string }[] = [
  { icon: "calendar-2", label: "Request time off" },
  { icon: "document-text-16", label: "View my documents" },
  { icon: "message", label: "Read my messages", href: "/messages" },
  { icon: "menu-board", label: "Pick up open shift" },
  { icon: "setting-2-16", label: "Profile settings" },
];

export const TASKS = [
  "Complete annual training",
  "Review and sign handbook",
  "Submit time off request",
];

export const DOCK_AVATARS: Pick<AvatarProps, "src" | "color">[] = [
  { src: "/images/avatar-sample.png", color: "pink" },
  { src: "/images/team-avatar-2.png" },
  { src: "/images/team-kristin.png" },
];
