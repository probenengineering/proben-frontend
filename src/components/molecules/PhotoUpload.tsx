"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

// Staff photo picker (Figma "Photo upload" 103:18675): a 52px slate-50 circle with a dashed
// grey-300 border and a 20px upload icon, then "Upload photo" (Inter Semi Bold 13/18 green-ink)
// over "JPG or PNG, up to 5 MB." (12/17 slate-500), 12px apart. A picked photo fills the circle
// (no Figma frame for that); larger files or other types are refused with a toast. `status`
// replaces the hint while the photo uploads and is checked, or says why it can't be used
// (13/18 danger-600, as field errors); no Figma frame for those.
export type PhotoUploadStatus = "idle" | "uploading" | "scanning" | "ready" | "blocked" | "failed";

export interface PhotoUploadProps {
  onChange?: (file: File | null) => void;
  status?: PhotoUploadStatus;
}

const MAX_BYTES = 5 * 1024 * 1024;

const HINTS: Record<PhotoUploadStatus, string> = {
  idle: "JPG or PNG, up to 5 MB.",
  ready: "JPG or PNG, up to 5 MB.",
  uploading: "Uploading…",
  scanning: "Checking the photo…",
  blocked: "This photo can’t be used. Choose another.",
  failed: "The photo didn’t upload. Choose it again.",
};

export function PhotoUpload({ onChange, status = "idle" }: PhotoUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  const failed = status === "blocked" || status === "failed";

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showToast("error", "Choose a JPG or PNG photo.");
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast("error", "That photo is over 5 MB.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    onChange?.(file);
  };

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      className="group flex items-center gap-3 text-left"
    >
      <span className="flex size-13 shrink-0 items-center justify-center overflow-clip rounded-full border border-dashed border-grey-300 bg-slate-50">
        {preview && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <Icon name="upload-photo-20" />
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="type-ui-13 font-semibold text-green-ink group-hover:underline">
          {preview ? "Change photo" : "Upload photo"}
        </span>
        <span
          role={failed ? "alert" : undefined}
          aria-live={failed ? undefined : "polite"}
          className={cn(failed ? "type-ui-13 text-danger-600" : "type-ui-12-17 text-slate-500")}
        >
          {HINTS[status]}
        </span>
      </span>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png"
        hidden
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </button>
  );
}
