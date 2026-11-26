// Figma "Now Indicator" (60:5656): 8px red dot, "Now · 11:10 AM" in Inter Semi Bold 11/16, then
// a 1.5px red line to the end of the row.
export interface NowIndicatorProps {
  /** "11:10 AM". */
  time: string;
}

export function NowIndicator({ time }: NowIndicatorProps) {
  return (
    <li className="flex w-full items-center gap-2" aria-label={`Now, ${time}`}>
      <span className="size-2 shrink-0 rounded-full bg-danger-500" aria-hidden />
      <span className="type-ui-11 font-semibold whitespace-nowrap text-danger-500">
        Now · {time}
      </span>
      <span className="h-[1.5px] min-w-px flex-1 bg-danger-500" aria-hidden />
    </li>
  );
}
