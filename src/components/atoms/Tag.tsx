import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Small grey label, e.g. the user's role "Caregiver". Figma trims the text box to the cap height.
export interface TagProps {
  children: ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "rounded-[12px] bg-white-400 p-2 type-title-sm whitespace-nowrap text-black [text-box:trim-both_cap_alphabetic]",
        className,
      )}
    >
      {children}
    </span>
  );
}
