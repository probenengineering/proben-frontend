"use server";

import { errorMessage } from "@/lib/auth/api";

import { commandCenter } from "./api";

// Home actions. The home profile panel's Notifications switch: PATCH /homes/{id}/notifications
// (mutes your push for this home's records and home-tagged chats; inbox items still arrive). The
// home page: acknowledge a home update (POST /home-updates/{id}/acknowledge, Figma 60:14383) and
// pick up an open shift (POST /shifts/{id}/pickup, Figma 60:14124).

export type HomeMuteResult = { ok: true; muted: boolean } | { ok: false; error: string };

export async function setHomeMuted(homeId: string, muted: boolean): Promise<HomeMuteResult> {
  try {
    const data = await commandCenter<{ notificationsMuted: boolean }>(
      `/homes/${encodeURIComponent(String(homeId))}/notifications`,
      { method: "PATCH", body: { muted: Boolean(muted) } },
    );
    return { ok: true, muted: data.notificationsMuted };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export type HomeActionResult = { ok: true; at?: string } | { ok: false; error: string };

export async function acknowledgeUpdateAction(id: string): Promise<HomeActionResult> {
  try {
    const res = await commandCenter<{ acknowledgedAt?: string }>(
      `/home-updates/${encodeURIComponent(id)}/acknowledge`,
      { method: "POST" },
    );
    return { ok: true, at: res?.acknowledgedAt };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function pickupShiftAction(id: string): Promise<HomeActionResult> {
  try {
    await commandCenter(`/shifts/${encodeURIComponent(id)}/pickup`, { method: "POST" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
