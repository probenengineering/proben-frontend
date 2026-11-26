"use server";

import { errorMessage } from "@/lib/auth/api";
import { notificationsApi } from "@/lib/notifications";

// Read-state actions for the notifications page. Each returns { ok } or { ok: false, error }
// so the list can roll back its optimistic change and show a toast.

export type NotificationActionResult = { ok: true } | { ok: false; error: string };

async function run(call: () => Promise<unknown>): Promise<NotificationActionResult> {
  try {
    await call();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function markNotificationRead(id: string) {
  return run(() =>
    notificationsApi(`/inbox/${encodeURIComponent(String(id))}/read`, { method: "POST" }),
  );
}

/** Marks the whole active inbox read (no category: the page has no category filter). */
export async function markAllNotificationsRead() {
  return run(() => notificationsApi("/inbox/read-all", { body: {} }));
}
