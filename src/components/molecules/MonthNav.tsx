import { IconButton } from "@/components/atoms";

// ‹ October 2026 › — previous/next buttons around the month (no logic yet).
export interface MonthNavProps {
  label: string;
}

export function MonthNav({ label }: MonthNavProps) {
  return (
    <div className="flex items-center gap-4.5">
      <IconButton icon="chevron-left" label="Previous month" />
      <span className="type-title-md whitespace-nowrap text-black">{label}</span>
      <IconButton icon="chevron-right" label="Next month" />
    </div>
  );
}
