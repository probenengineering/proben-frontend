import Link from "next/link";

import { Avatar, Icon } from "@/components/atoms";
import { signOut } from "@/lib/auth/actions";

// Signed-in user at the bottom of the sidebar: avatar (online), name, email, sign-out icon.
// The icon signs out (POST /auth/logout) and goes to /sign-in. Signed out, it links to /sign-in.
// compact: avatar only, centred (collapsed sidebar).
export interface UserCardProps {
  name: string;
  email?: string;
  avatarSrc?: string;
  /** Shown in the avatar when there's no photo, e.g. "AE". */
  initials?: string;
  /** False when nobody is signed in: the icon links to /sign-in instead of signing out. */
  signedIn?: boolean;
  compact?: boolean;
}

export function UserCard({
  name,
  email,
  avatarSrc,
  initials,
  signedIn = true,
  compact,
}: UserCardProps) {
  const avatar = (
    <Avatar
      src={avatarSrc}
      alt={name}
      initials={initials}
      color="peach"
      status={signedIn ? "online" : undefined}
    />
  );

  if (compact) {
    return (
      <div className="flex w-full items-center justify-center rounded-[4px] px-4 py-3">
        {avatar}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between rounded-[4px] px-6 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {avatar}
        <div className="flex flex-col type-paragraph-sm">
          <p className="w-33 truncate font-semibold text-grey-900">{name}</p>
          {email && <p className="w-33 truncate text-grey-600">{email}</p>}
        </div>
      </div>
      {signedIn ? (
        <form action={signOut}>
          <button type="submit" aria-label="Sign out" className="flex cursor-pointer">
            <Icon name="sign-out" />
          </button>
        </form>
      ) : (
        <Link href="/sign-in" aria-label="Sign in">
          <Icon name="sign-out" />
        </Link>
      )}
    </div>
  );
}
