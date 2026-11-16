import "server-only";

import { getCurrentUser } from "@/lib/auth/user";
import { SAMPLE_NOTIFICATIONS } from "@/lib/sample-notifications";
import type { AppNotification } from "@/types/notification";

// Notifications. TEMPORARY: Figma samples when signed in, none when not (empty state,
// Figma 51:11583). Swap point for GET /notifications (docs/command-center.md §5).
export async function getNotifications(): Promise<AppNotification[]> {
  const user = await getCurrentUser();
  return user ? SAMPLE_NOTIFICATIONS : [];
}
