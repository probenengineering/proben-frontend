import { Skeleton } from "@/components/atoms";

import type { PlacedEvent } from "./CalendarDayColumn";

// Week calendar loading block (Figma "Skeleton" in 60:8230): skeleton-grid fill, 6px radius, inset
// 2px from its half-hour / hour slot. The layout below copies the frame; `title` carries the
// block's opacity (1, 0.75 or 0.55) and `day` the column (0 = Sunday).
export const WEEK_SKELETON: (PlacedEvent & { day: number })[] = [
  [1, 8, 1, "1"],
  [1, 9, 0.5, "0.75"],
  [1, 9.5, 0.5, "0.55"],
  [2, 9, 1, "1"],
  [4, 9, 0.5, "0.75"],
  [4, 9.5, 0.5, "0.55"],
  [2, 10, 1, "1"],
  [4, 10, 1, "0.75"],
  [1, 11, 1, "0.55"],
  [2, 11, 1, "1"],
  [4, 11, 1, "0.75"],
  [1, 12, 1, "0.55"],
  [2, 12, 1, "1"],
  [4, 12, 1, "0.75"],
  [1, 13, 1, "0.55"],
  [2, 13, 1, "1"],
  [1, 14, 1, "0.75"],
  [2, 14, 1, "0.55"],
  [3, 15, 1, "1"],
  [1, 16, 1, "0.75", 0, 2],
  [1, 16, 1, "0.55", 1, 2],
].map(([day, start, duration, title, lane = 0, lanes = 1]) => ({
  day: day as number,
  start: start as number,
  duration: duration as number,
  title: title as string,
  time: "",
  lane: lane as number,
  lanes: lanes as number,
}));

export interface CalendarSkeletonBlockProps {
  event: PlacedEvent;
}

export function CalendarSkeletonBlock({ event }: CalendarSkeletonBlockProps) {
  return (
    <Skeleton
      className="mt-0.5 h-[calc(100%-4px)] w-[calc(100%-4px)] bg-skeleton-grid"
      style={{ opacity: Number(event.title) }}
    />
  );
}
