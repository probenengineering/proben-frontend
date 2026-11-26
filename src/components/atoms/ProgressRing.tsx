import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// 176px ring from the v2 "My time" card (Figma Time Clock 60:5349). Track and progress are Figma
// arc ellipses (inner radius 86%, so 12.32px thick) with flat ends, filling clockwise from
// 12 o'clock. Overtime draws a red arc over the full green one, from 12 o'clock.
const SIZE = 176;
const STROKE = (SIZE / 2) * 0.14;
const RADIUS = SIZE / 2 - STROKE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const arcTones = {
  green: "stroke-green-500",
  caution: "stroke-caution-500",
  info: "stroke-info-500",
};

const trackTones = {
  default: "stroke-ring-track",
  danger: "stroke-danger-100",
};

export interface ProgressRingProps {
  /** 0–1. */
  value: number;
  tone?: keyof typeof arcTones;
  /** "danger" = the pink track of "Clock-in failed". */
  track?: keyof typeof trackTones;
  /** 0–1 share drawn in red over the arc (overtime). */
  overtime?: number;
  /** Centred content (timer + caption). */
  children?: ReactNode;
  className?: string;
}

function Arc({ value, className }: { value: number; className: string }) {
  if (value <= 0) return null;
  return (
    <circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={RADIUS}
      strokeWidth={STROKE}
      strokeDasharray={`${Math.min(1, value) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      className={cn("transition-[stroke-dasharray] duration-500", className)}
    />
  );
}

export function ProgressRing({
  value,
  tone = "green",
  track = "default",
  overtime = 0,
  children,
  className,
}: ProgressRingProps) {
  return (
    <div className={cn("relative size-44 shrink-0", className)}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
        aria-hidden
        className="block"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          className={trackTones[track]}
        />
        <Arc value={value} className={arcTones[tone]} />
        <Arc value={overtime} className="stroke-danger-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {children}
      </div>
    </div>
  );
}
