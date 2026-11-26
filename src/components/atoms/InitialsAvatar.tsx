import { avatarTint, initialsOf } from "@/lib/avatar-tint";
import { cn } from "@/lib/utils";

// Round initials avatar (Figma home team 60:14002, updates 60:14311, shifts 60:14201): Inter Semi
// Bold initials in a tint picked from the name. Sizes: 32 (12/16), 36 (12/18), 44 (14/18).
// `ring` adds the 2px white edge used when avatars overlap.
export interface InitialsAvatarProps {
  name: string;
  size?: 32 | 36 | 44;
  ring?: boolean;
  className?: string;
}

const SIZES = {
  32: "size-8 type-ui-12-16",
  36: "size-9 type-ui-12",
  44: "size-11 type-ui-14-18",
};

export function InitialsAvatar({ name, size = 32, ring, className }: InitialsAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size],
        avatarTint(name),
        ring && "border-2 border-white",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
