import { cn } from "@/lib/utils";

// Figma "Radio" (role cards 103:18126 / 103:18127): 20px circle, white. Off: 1px grey-300 border.
// On: a 6px green-500 ring around a white centre. Visual only; the card is the control.
export interface RadioDotProps {
  checked: boolean;
}

export function RadioDot({ checked }: RadioDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-5 shrink-0 rounded-full bg-white",
        checked ? "border-6 border-green-500" : "border border-grey-300",
      )}
    />
  );
}
