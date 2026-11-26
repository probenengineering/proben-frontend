import { cn } from "@/lib/utils";

// Green date tile: weekday over day number.
// "soft" = Open Shift Card (Figma 60:5662): 44px, 10px radius, 12% green tint, green-ink text,
//   Inter Bold 10/12 + Semi Bold 16/20.
// "solid" = day popover (Figma 60:7513): 48 × 52, 12px radius, green-500 fill, white text,
//   Inter Bold 10/14 + Semi Bold 20/26.
export interface DateBadgeProps {
  /** "TUE". */
  weekday: string;
  /** "23". */
  day: string | number;
  variant?: "soft" | "solid";
  className?: string;
}

export function DateBadge({ weekday, day, variant = "soft", className }: DateBadgeProps) {
  const solid = variant === "solid";
  return (
    <span
      className={cn(
        "flex shrink-0 flex-col items-center justify-center whitespace-nowrap",
        solid
          ? "h-13 w-12 rounded-[12px] bg-green-500 text-white"
          : "size-11 rounded-[10px] bg-green-500/12 text-green-ink",
        className,
      )}
    >
      <span className={cn("font-bold", solid ? "type-ui-10" : "type-ui-10-tight")}>{weekday}</span>
      <span className={cn("font-semibold", solid ? "type-ui-20-26" : "type-ui-16-tight")}>
        {day}
      </span>
    </span>
  );
}
