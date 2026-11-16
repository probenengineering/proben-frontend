import { cn } from "@/lib/utils";

// Column titles for the My Homes table (Figma 51:12496): Home · Location · Residents · Tasks · ›.
// Full width: 360 · 360 · 147 · 147 · 72 at 1086px (the first two share the spare width).
// compact (profile panel open, 51:12782): 200 · 200 · flex · flex · 69. Hidden below sm.
export const HOME_TABLE_COLUMNS = {
  full: "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_147px_147px_72px]",
  compact: "sm:grid-cols-[200px_200px_minmax(0,1fr)_minmax(0,1fr)_69px]",
};

export interface HomeTableHeaderProps {
  compact?: boolean;
}

export function HomeTableHeader({ compact }: HomeTableHeaderProps) {
  return (
    <div
      className={cn(
        "hidden h-11.5 items-center border-b border-white-200 bg-white type-paragraph-sm font-sans! text-black-60 sm:grid",
        compact ? HOME_TABLE_COLUMNS.compact : HOME_TABLE_COLUMNS.full,
      )}
    >
      <span className="pr-2 pl-5">Home</span>
      <span className="px-3">Location</span>
      <span className="px-10">Residents</span>
      <span className="px-10">Tasks</span>
      <span />
    </div>
  );
}
