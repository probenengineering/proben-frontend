import Image from "next/image";

import { cn } from "@/lib/utils";

// SVG icons exported from Figma into /public/icons.
export type IconName =
  | "mail"
  | "lock"
  | "google"
  | "close-circle"
  | "tick-circle"
  | "home"
  | "messages"
  | "grid"
  | "notification"
  | "notification-bing"
  | "user"
  | "chevron-down"
  | "unlock"
  | "setting-2"
  | "setting-4"
  | "sort"
  | "direct-inbox"
  | "direct-normal"
  | "sign-out"
  | "search"
  | "arrow-down"
  | "arrow-up"
  | "arrow-right"
  | "kbd-cmd"
  | "kbd-k"
  | "call"
  | "video"
  | "more-circle"
  | "happyemoji"
  | "gallery"
  | "attach-square"
  | "add"
  | "send"
  | "sms"
  | "document-text"
  | "hospital"
  | "copy"
  | "toggle-on"
  | "close"
  | "download"
  | "kbd-f"
  | "user-16"
  | "profile-2user"
  | "profile-2user-16"
  | "volume-high"
  | "message-notif"
  | "grid-16"
  | "info-circle"
  | "attach-square-outline"
  | "home-linear"
  | "check"
  | "happyemoji-sm"
  | "message-text"
  | "send-2"
  | "more-vert"
  | "document-upload"
  | "happyemoji-outline"
  | "edit"
  | "copy-14"
  | "forward-square"
  | "trash"
  | "folder"
  | "calendar-2"
  | "calendar-add"
  | "location"
  | "clock"
  | "building-4"
  | "message"
  | "menu-board"
  | "arrow-right-16"
  | "arrow-right-14"
  | "video-16"
  | "document-text-16"
  | "setting-2-16"
  | "send-2-16"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down-18"
  | "arrow-right-24"
  | "video-badge-blue"
  | "video-badge-purple"
  | "video-badge-amber"
  | "close-xs";

export interface IconProps {
  name: IconName;
  /** Size in px. Figma icons are 20px. */
  size?: number;
  /** Height in px for non-square icons (e.g. download is 20x16). Defaults to size. */
  height?: number;
  /** Leave empty for decorative icons. */
  alt?: string;
  className?: string;
}

export function Icon({ name, size = 20, height, alt = "", className }: IconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      width={size}
      height={height ?? size}
      alt={alt}
      className={cn("shrink-0", className)}
    />
  );
}
