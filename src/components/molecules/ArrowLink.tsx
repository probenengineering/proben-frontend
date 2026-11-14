import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Text link with a trailing arrow. "grey" = "View all open shifts →" (16px grey arrow);
// "black" = "View all tasks ›" (14px chevron-style arrow).
export interface ArrowLinkProps {
  children: ReactNode;
  href?: string;
  tone?: "grey" | "black";
  className?: string;
}

export function ArrowLink({ children, href = "#", tone = "grey", className }: ArrowLinkProps) {
  const grey = tone === "grey";
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-center type-title-md font-medium whitespace-nowrap",
        grey ? "gap-2 px-2 text-black-50" : "gap-2.5 rounded-[32px] p-2 text-black",
        className,
      )}
    >
      {children}
      <Icon name={grey ? "arrow-right-16" : "arrow-right-14"} size={grey ? 16 : 14} />
    </Link>
  );
}
