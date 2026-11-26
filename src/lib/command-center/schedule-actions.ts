"use server";

import { errorMessage } from "@/lib/auth/api";

import { commandCenter } from "./api";

// "Mark as complete" / ticking a row in the Schedule list. Only calendar events: POST
// /events/{id}/complete. Tasks are completed through their form (draft → submit), not here.

export type CompleteResult = { ok: true } | { ok: false; error: string };

export async function completeEventAction(id: string): Promise<CompleteResult> {
  try {
    await commandCenter(`/events/${encodeURIComponent(String(id))}/complete`, { method: "POST" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
