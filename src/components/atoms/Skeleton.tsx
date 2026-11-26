import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

// Loading placeholder bar (Figma "Skeleton", 60:7100): slate-100 fill with a soft pulse. Size and
// radius come from className (6px by default; Figma uses 2px for bars, 4px for tags, full for pills).
export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={style}
      className={cn("block animate-pulse rounded-[6px] bg-slate-100", className)}
    />
  );
}
