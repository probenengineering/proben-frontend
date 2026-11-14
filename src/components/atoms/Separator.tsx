import { cn } from "@/lib/utils";

// Thin full-width line between sections (Figma "Line", #E6E6E6 = black-10).
export interface SeparatorProps {
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  return <div role="separator" className={cn("h-px w-full shrink-0 bg-black-10", className)} />;
}
