import Link from "next/link";

import { Avatar, type AvatarProps, Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Floating "Messages" pill (bottom right of the dashboard): send icon, label, up to three
// overlapping 24px avatars (people recently messaged) and an up arrow. 233px wide, 26px radius,
// white-400 border. Opens /messages.
export interface MessagesDockProps {
  avatars: Pick<AvatarProps, "src" | "color" | "initials" | "alt">[];
  className?: string;
}

export function MessagesDock({ avatars, className }: MessagesDockProps) {
  return (
    <Link
      href="/messages"
      className={cn(
        "flex w-58.25 items-center justify-between rounded-[26px] border border-white-400 bg-white py-2 pr-2 pl-4",
        className,
      )}
    >
      <span className="flex items-center gap-2.5 type-title-sm font-medium text-black">
        <Icon name="send-2-16" size={16} />
        Messages
      </span>
      <span className="flex items-center gap-1">
        <span className="flex items-center">
          {avatars.map((avatar, i) => (
            <Avatar
              key={avatar.src ?? i}
              size="sm"
              {...avatar}
              className={cn(i < avatars.length - 1 && "-mr-2")}
            />
          ))}
        </span>
        {/* Figma: arrow-down flipped vertically. */}
        <Icon name="arrow-down" size={16} className="-scale-y-100" />
      </span>
    </Link>
  );
}
