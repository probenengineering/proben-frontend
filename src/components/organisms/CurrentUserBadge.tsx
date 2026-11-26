
import { Avatar, Tag } from "@/components/atoms";
import { getCurrentUser } from "@/lib/auth/user";

// Header corner (Figma: role tag + 40px avatar with the green online dot) for the signed-in person
// (GET /auth/me): their first role, e.g. "Caregiver", and their initials (no photos in the API yet).
// Reads the session, so it streams in; until then (or signed out) only a plain avatar shows.
async function SignedInBadge() {
  const user = await getCurrentUser();
  if (!user) return <Avatar color="peach" />;
  return (
    <>
      {user.role && <Tag>{user.role}</Tag>}
      <Avatar initials={user.initials} alt={user.name} color="peach" status="online" />
    </>
  );
}

export function CurrentUserBadge() {
  return (
    <div className="flex items-center gap-3">
      <SignedInBadge />
    </div>
  );
}
