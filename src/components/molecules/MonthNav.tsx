import Link from "next/link";

import { Icon, IconButton } from "@/components/atoms";

// ‹ October 2026 › — previous/next around the period. With prevHref/nextHref the arrows are links
// (calendar day / week / month); without them they're the static buttons (list view).
export interface MonthNavProps {
  label: string;
  prevHref?: string;
  nextHref?: string;
  /** "Previous week" etc. */
  prevLabel?: string;
  nextLabel?: string;
}

const arrowLink =
  "flex size-6 shrink-0 items-center justify-center rounded-[4px] border border-black-20 bg-white hover:bg-white-50";

export function MonthNav({
  label,
  prevHref,
  nextHref,
  prevLabel = "Previous month",
  nextLabel = "Next month",
}: MonthNavProps) {
  return (
    <div className="flex items-center gap-4.5">
      {prevHref ? (
        <Link href={prevHref} aria-label={prevLabel} className={arrowLink}>
          <Icon name="chevron-left" />
        </Link>
      ) : (
        <IconButton icon="chevron-left" label={prevLabel} />
      )}
      <span className="type-title-md whitespace-nowrap text-black">{label}</span>
      {nextHref ? (
        <Link href={nextHref} aria-label={nextLabel} className={arrowLink}>
          <Icon name="chevron-right" />
        </Link>
      ) : (
        <IconButton icon="chevron-right" label={nextLabel} />
      )}
    </div>
  );
}
