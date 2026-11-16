import "server-only";

import { getCurrentUser } from "@/lib/auth/user";
import { SAMPLE_HOMES } from "@/lib/sample-homes";
import type { AssignedHome } from "@/types/home";

// My Homes data. TEMPORARY: Figma sample homes when signed in, none when not (empty state,
// Figma 51:11543). Swap point for GET /homes/assigned (docs/command-center.md §4).
export async function getAssignedHomes(): Promise<AssignedHome[]> {
  const user = await getCurrentUser();
  return user ? SAMPLE_HOMES : [];
}
