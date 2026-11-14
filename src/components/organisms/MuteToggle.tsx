"use client";

import { useState, useTransition } from "react";

import { Switch } from "@/components/atoms";
import { setMuted } from "@/lib/messaging/actions";
import { showToast } from "@/lib/toast";

// The profile panel's Notifications switch: on = this chat is muted (no notifications).
// Changes straight away and switches back if the request fails.
export interface MuteToggleProps {
  conversationId: string;
  muted: boolean;
}

export function MuteToggle({ conversationId, muted: initial }: MuteToggleProps) {
  const [muted, setMutedState] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      aria-label="Mute notifications for this conversation"
      checked={muted}
      disabled={pending}
      onCheckedChange={(next) => {
        setMutedState(next);
        startTransition(async () => {
          const result = await setMuted(conversationId, next);
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
