import { Avatar, type AvatarProps } from "@/components/atoms";

// Two small (24px) overlapping avatars in a 40px box, used for group chats.
export interface AvatarPairProps {
  first: Pick<AvatarProps, "src" | "color">;
  second: Pick<AvatarProps, "src" | "color">;
}

export function AvatarPair({ first, second }: AvatarPairProps) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center">
      <Avatar size="sm" {...first} className="-mr-2" />
      <Avatar size="sm" {...second} />
    </div>
  );
}
