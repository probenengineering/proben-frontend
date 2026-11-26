import "server-only";

import { getAccessToken } from "@/lib/auth/session";
import { getTodayOverview, listHomes } from "@/lib/command-center/api";

// Home right column: your assigned homes' names and the tasks that need attention (both from
// the Command Center; the overview request is shared with the main column).

export interface DashboardAsideData {
  homes: string[];
  tasks: string[];
}

export async function getDashboardAside(): Promise<DashboardAsideData> {
  if (!(await getAccessToken())) return { homes: [], tasks: [] };
  const [today, homes] = await Promise.all([
    getTodayOverview().catch(() => null),
    listHomes().catch(() => null),
  ]);
  return {
    homes: homes?.items.map((home) => home.name) ?? [],
    tasks: today?.overview.needsAttention?.items.map((task) => task.title) ?? [],
  };
}
