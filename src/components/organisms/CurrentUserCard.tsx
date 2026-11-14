import { UserCard } from "@/components/molecules";
import { getCurrentUser } from "@/lib/auth/user";

// The sidebar's user card filled with the signed-in person (GET /auth/me).
// Reads the session, so render it inside <Suspense> (see AppSidebar).
export interface CurrentUserCardProps {
  compact?: boolean;
}

export async function CurrentUserCard({ compact }: CurrentUserCardProps) {
  const user = await getCurrentUser();
  if (!user) return <UserCard name="Not signed in" signedIn={false} compact={compact} />;
  return (
    <UserCard name={user.name} email={user.email} initials={user.initials} compact={compact} />
  );
}
