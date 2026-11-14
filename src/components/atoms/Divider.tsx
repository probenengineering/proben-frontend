import { cn } from "@/lib/utils";

export interface DividerProps {
  /** Optional text in the middle, e.g. "or" */
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  return (
    <div className={cn("flex w-full items-center gap-2.25", className)}>
      <span className="h-px flex-1 bg-white-500" />
      {label && (
        // Figma fixes this text box at 12px tall, so the row stays 12px high.
        <span className="h-3 type-title-sm leading-3 text-black">{label}</span>
      )}
      <span className="h-px flex-1 bg-white-500" />
    </div>
  );
}
