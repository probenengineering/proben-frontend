"use client";

import { useState, useTransition } from "react";

import { completeEventAction } from "@/lib/command-center/schedule-actions";
import { showToast } from "@/lib/toast";
import type { ScheduleItem } from "@/types/schedule";

// Shared state for the calendar views: which item's quick peek / detail panel is open, and
// optimistic "Mark complete" (events only; rolled back with a toast if the API refuses).

export const itemKey = (item: ScheduleItem) => `${item.kind}-${item.id}`;

export function useScheduleActions() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const local = (item: ScheduleItem): ScheduleItem =>
    completed.has(itemKey(item)) ? { ...item, status: "completed", canComplete: false } : item;

  const mark = (key: string, done: boolean) =>
    setCompleted((prev) => {
      const next = new Set(prev);
      if (done) next.add(key);
      else next.delete(key);
      return next;
    });

  const complete = (item: ScheduleItem) => {
    if (!item.canComplete) return;
    const key = itemKey(item);
    mark(key, true);
    startTransition(async () => {
      const result = await completeEventAction(item.id);
      if (!result.ok) {
        mark(key, false);
        showToast("error", result.error);
      }
    });
  };

  return {
    local,
    complete,
    pending,
    openKey,
    setOpenKey,
    detailKey,
    showDetails: (item: ScheduleItem) => {
      setOpenKey(null);
      setDetailKey(itemKey(item));
    },
    closeDetails: () => setDetailKey(null),
  };
}
