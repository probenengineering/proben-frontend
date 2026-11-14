import { cn } from "@/lib/utils";

// Reaction under a message, e.g. 👍 1. Small Inter Tight caption (same one-off as other captions).
// Clicking toggles your reaction; yours gets a thin green-500 outline (not in Figma).
export interface ReactionChipProps {
  emoji: string;
  count: number;
  mine?: boolean;
  onClick?: () => void;
}

export function ReactionChip({ emoji, count, mine, onClick }: ReactionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={mine}
      aria-label={`${emoji} ${count}`}
      className={cn(
        "flex h-5 items-center gap-0.5 rounded-[4px] border border-transparent bg-white p-1 type-caption-sm font-sans! tracking-[0.04em]! whitespace-nowrap",
        mine && "border-green-500",
      )}
    >
      <span>{emoji}</span>
      <span className="text-black">{count}</span>
    </button>
  );
}
