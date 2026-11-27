"use server";

import { listAdminTasks } from "./api";

// All staff row actions that need a read first.

/**
 * Open tasks (not completed or cancelled) assigned to someone, for the Deactivate dialog's "N
 * open tasks stay assigned". GET /admin/tasks?staffId=… counts; null when it can't be read.
 */
export async function openTaskCountAction(staffId: string): Promise<number | null> {
  try {
    const { counts } = await listAdminTasks({ staffId, limit: 1 });
    return counts.upcoming + counts.in_progress + counts.submitted + counts.needs_attention;
  } catch {
    return null;
  }
}
