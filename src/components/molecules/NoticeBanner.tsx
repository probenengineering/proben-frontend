import type { ReactNode } from "react";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Page banner, three tones:
// - error (Figma "Error summary" 103:18750): danger-50, danger-200 border, 14 × 10, 10px gap, 18px
//   red icon, Inter Medium 14/20 danger-700.
// - info (Figma "Scope note" 103:19639): info-50, info-200 border, 12 × 10, 8px gap, 16px blue
//   icon, Inter Medium 13/18 info-700.
// - warning (Figma "Home mismatch warning" 103:20446): caution-50, caution-200 border, 14 × 12,
//   10px gap, 18px amber icon; title Semi Bold 14/20 over message 13/18, both caution-700; an
//   optional action on the right (Semi Bold 13/18 green-ink).
// All 12px radius.
export interface NoticeBannerProps {
  message: string;
  tone?: "error" | "info" | "warning";
  title?: string;
  action?: ReactNode;
}

const ICONS = { error: "info-red-18", info: "info-blue-16", warning: "warning-amber-18" } as const;

export function NoticeBanner({ message, tone = "error", title, action }: NoticeBannerProps) {
  return (
    <div
      role={tone === "info" ? "status" : "alert"}
      className={cn(
        "flex w-full rounded-[12px] border",
        tone === "error" && "items-center gap-2.5 border-danger-200 bg-danger-50 px-3.5 py-2.5",
        tone === "info" && "items-center gap-2 border-info-200 bg-info-50 px-3 py-2.5",
        tone === "warning" && "items-start gap-2.5 border-caution-200 bg-caution-50 px-3.5 py-3",
      )}
    >
      <Icon name={ICONS[tone]} size={tone === "info" ? 16 : 18} />
      {tone === "warning" ? (
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-caution-700">
          {title && <p className="type-ui-14 font-semibold">{title}</p>}
          <p className="type-ui-13">{message}</p>
        </div>
      ) : (
        <p
          className={cn(
            "min-w-0 flex-1 font-medium",
            tone === "error" ? "type-ui-14 text-danger-700" : "type-ui-13 text-info-700",
          )}
        >
          {message}
        </p>
      )}
      {action && <div className="shrink-0 type-ui-13 font-semibold text-green-ink">{action}</div>}
    </div>
  );
}
