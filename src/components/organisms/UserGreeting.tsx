import { TimeGreeting } from "@/components/molecules/TimeGreeting";
import { getCurrentUser } from "@/lib/auth/user";

// The dashboard title: "Good afternoon, George" for the signed-in person. Reads the session, so
// DashboardHeader renders it inside <Suspense>.
export async function UserGreeting() {
  const user = await getCurrentUser();
  return <TimeGreeting name={user?.name.split(" ")[0]} />;
}
