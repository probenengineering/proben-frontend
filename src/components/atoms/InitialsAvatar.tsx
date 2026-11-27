import { avatarTint, initialsOf } from "@/lib/avatar-tint";
import { cn } from "@/lib/utils";

import { AvatarPhoto } from "./AvatarPhoto";

// Round initials avatar (Figma home team 60:14002, updates 60:14311, shifts 60:14201): Inter Semi
// Bold initials in a tint picked from the name. Sizes: 32 (12/16), 36 (12/18), 40 (14/20, All staff
// 103:18400), 44 (14/18), 64 (20/28, staff profile 103:18939). `tintClassName` replaces the picked tint (staff rows use Figma's own).
// `ring` adds the 2px white edge used when avatars overlap.
export interface InitialsAvatarProps {
  name: string;
  size?: 32 | 36 | 40 | 44 | 64;
  ring?: boolean;
  /** Background + text colour classes instead of the name-picked tint. */
  tintClassName?: string;
  /** Profile photo; fades in over the initials once loaded (initials stay if it fails). */
  photoSrc?: string;
  className?: string;
}

const SIZES = {
  32: "size-8 type-ui-12-16",
  36: "size-9 type-ui-12",
  40: "size-10 type-ui-14",
  44: "size-11 type-ui-14-18",
  64: "size-16 type-ui-20",
};

export function InitialsAvatar({
  name,
  size = 32,
  ring,
  tintClassName,
  photoSrc,
  className,
}: InitialsAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size],
        tintClassName ?? avatarTint(name),
        ring && "border-2 border-white",
        className,
      )}
    >
      {initialsOf(name)}
      {photoSrc && <AvatarPhoto src={photoSrc} />}
    </span>
  );
}
