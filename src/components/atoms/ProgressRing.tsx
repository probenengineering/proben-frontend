import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// 160px ring from the "My time" card: #EEEEEF track plus a round-capped arc that fills
// clockwise from 12 o'clock. Figma ships the arcs as fixed shapes; this redraws them so the
// fill can follow the timer. Ring is 18.9px thick (outer r 80, inner r 61.09), as in Figma.
// Gradients copy Figma's Ellipse 7: "fade" = #EEEEEF → #6ACD04 (clocked in),
// "solid" = #9AFB37 → #6ACD04 (break).
const SIZE = 160;
const STROKE = 18.906;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const gradients = {
  fade: {
    coords: { x1: 85, y1: 9.24, x2: 160, y2: 80.74 },
    from: "var(--color-white-400)",
    to: "var(--color-clock-arc-end)",
  },
  solid: {
    coords: { x1: 118, y1: 0, x2: 35, y2: 18 },
    from: "var(--color-clock-arc-start)",
    to: "var(--color-clock-arc-end)",
  },
};

export interface ProgressRingProps {
  /** 0–1. */
  value: number;
  variant?: keyof typeof gradients;
  /** Centred content (timer + pill). */
  children?: ReactNode;
  className?: string;
}

export function ProgressRing({ value, variant = "fade", children, className }: ProgressRingProps) {
  const id = useId();
  const progress = Math.min(1, Math.max(0, value));
  const gradient = gradients[variant];

  return (
    <div className={cn("relative size-40 shrink-0", className)}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
        aria-hidden
        className="block"
      >
        <defs>
          {/* Cancels the arc's −90° rotation so the gradient sits where Figma puts it. */}
          <linearGradient
            id={id}
            gradientUnits="userSpaceOnUse"
            gradientTransform={`rotate(90 ${SIZE / 2} ${SIZE / 2})`}
            {...gradient.coords}
          >
            <stop style={{ stopColor: gradient.from }} />
            <stop offset="1" style={{ stopColor: gradient.to }} />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          className="stroke-white-400"
        />
        {progress > 0 && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            stroke={`url(#${id})`}
            strokeLinecap={progress < 1 ? "round" : "butt"}
            strokeDasharray={`${progress * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            className="transition-[stroke-dasharray] duration-500"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {children}
      </div>
    </div>
  );
}
