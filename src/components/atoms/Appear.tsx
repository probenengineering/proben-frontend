"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// Subtle entrance animation (Motion). "rise" = fade in while moving up 8px (page content);
// "right" = slide in 24px from the right (side panels); "fade" = opacity only.
// Respects the OS "reduce motion" setting via MotionProvider.
export interface AppearProps {
  children: ReactNode;
  from?: "rise" | "right" | "fade";
  /** Seconds before it starts. */
  delay?: number;
  className?: string;
}

const offsets = {
  rise: { y: 8 },
  right: { x: 24 },
  fade: {},
} as const;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Appear({ children, from = "rise", delay = 0, className }: AppearProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offsets[from] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
