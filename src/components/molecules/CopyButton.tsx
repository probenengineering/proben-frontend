"use client";

import { Icon } from "@/components/atoms";
import { copyText } from "@/lib/clipboard";
import { showToast } from "@/lib/toast";

// Figma's 16px copy icon as a button: copies `text` and confirms with a toast.
export interface CopyButtonProps {
  text: string;
  /** What's being copied, for the label and toast, e.g. "Email". */
  label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Copy ${label.toLowerCase()}`}
      onClick={() =>
        copyText(text)
          .then(() => showToast("success", `${label} copied`))
          .catch(() => showToast("error", `Couldn’t copy the ${label.toLowerCase()}`))
      }
      className="flex"
    >
      <Icon name="copy" size={16} />
    </button>
  );
}
