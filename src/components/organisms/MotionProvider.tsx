"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// App-wide Motion settings: animations shrink to opacity-only when the user has
// "reduce motion" turned on in their OS.
export interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
