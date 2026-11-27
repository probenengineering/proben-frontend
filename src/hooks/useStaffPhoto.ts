"use client";

import { useRef, useState } from "react";

import type { PhotoUploadStatus } from "@/components/molecules/PhotoUpload";
import { fileStatusAction } from "@/lib/staff-api/actions";
import { showToast } from "@/lib/toast";

// The Add staff photo (handover "Photo flow"): upload it as a staff_avatar through our /api/files
// route, then poll its scan until it's "clean"; only then can its id go on the new staff record.
// "infected" → blocked; "scan_error" / "deleted" / no answer → failed. Picking another photo
// abandons the earlier one.

const POLL_MS = 1500;
const MAX_POLLS = 40;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useStaffPhoto() {
  const [status, setStatus] = useState<PhotoUploadStatus>("idle");
  const [fileId, setFileId] = useState<string>();
  const latest = useRef(0);

  const settle = (run: number, next: PhotoUploadStatus, id?: string) => {
    if (run !== latest.current) return;
    setStatus(next);
    setFileId(id);
  };

  const pick = async (file: File | null) => {
    const run = ++latest.current;
    if (!file) return settle(run, "idle");
    settle(run, "uploading");

    const body = new FormData();
    body.set("file", file);
    body.set("clientUploadId", crypto.randomUUID());
    body.set("purpose", "staff_avatar");
    const res = await fetch("/api/files", { method: "POST", body }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !data.id) {
      if (run === latest.current) {
        showToast("error", data.message ?? "We couldn’t upload this photo. Try again.");
      }
      return settle(run, "failed");
    }

    const id = String(data.id);
    settle(run, "scanning", id);
    for (let i = 0; i < MAX_POLLS; i++) {
      const result = await fileStatusAction(id);
      if (run !== latest.current) return;
      const scan = result.ok ? result.data.status : undefined;
      if (scan === "clean") return settle(run, "ready", id);
      if (scan === "infected") return settle(run, "blocked");
      if (scan && scan !== "pending_scan") return settle(run, "failed");
      await wait(POLL_MS);
    }
    settle(run, "failed");
  };

  const reset = () => {
    latest.current++;
    setStatus("idle");
    setFileId(undefined);
  };

  return {
    status,
    /** Set once the photo passed its scan. */
    fileId: status === "ready" ? fileId : undefined,
    busy: status === "uploading" || status === "scanning",
    pick,
    reset,
  };
}
