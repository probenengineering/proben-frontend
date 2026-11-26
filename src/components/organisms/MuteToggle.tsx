"use client";

import { useState, useTransition } from "react";

import { Switch } from "@/components/atoms";
import { setHomeMuted } from "@/lib/command-center/home-actions";
import { setMuted } from "@/lib/messaging/actions";
import { showToast } from "@/lib/toast";

// A profile panel's Notifications switch: on = muted (no push notifications). Pass a chat's
// conversationId, or a homeId for a home (mutes that home's push; inbox items still arrive).
// Changes straight away and switches back if the request fails.
export type MuteToggleProps = { muted: boolean } & (
  { conversationId: string; homeId?: never } | { homeId: string; conversationId?: never }
);

export function MuteToggle({ conversationId, homeId, muted: initial }: MuteToggleProps) {
  const [muted, setMutedState] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      aria-label={`Mute notifications for this ${homeId ? "home" : "conversation"}`}
      checked={muted}
      disabled={pending}
      onCheckedChange={(next) => {
        setMutedState(next);
        startTransition(async () => {
          const result = homeId
            ? await setHomeMuted(homeId, next)
            : await setMuted(conversationId ?? "", next);
          if (result.ok) {
            showToast("success", next ? "Notifications muted" : "Notifications turned on");
          } else {
            setMutedState(!next);
            showToast("error", result.error);
          }
        });
      }}
    />
  );
}
