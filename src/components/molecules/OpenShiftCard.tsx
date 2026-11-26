import Link from "next/link";

import { Button, DateBadge } from "@/components/atoms";

// Figma "Open Shift Card" (60:5660): 12px-radius card with a 44px green date badge, home, then
// "7:00 AM – 3:00 PM · Madison, WI", and a "Pick up" pill. Hover: slate-50 fill, grey-300 border,
// and Pick up turns green. Picking up isn't wired yet (no logic until asked).
export interface OpenShiftCardProps {
  /** "FRI". */
  weekday: string;
  /** "26". */
  day: string;
  home: string;
  /** "7:00 AM – 3:00 PM · Madison, WI". */
  meta: string;
  href?: string;
}

export function OpenShiftCard({ weekday, day, home, meta, href = "#" }: OpenShiftCardProps) {
  return (
    <li className="group relative flex w-full items-center gap-3 rounded-[12px] border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-grey-300 hover:bg-slate-50">
      <DateBadge weekday={weekday} day={day} />
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <Link
          href={href}
          className="w-full truncate type-ui-14 font-semibold text-slate-900 after:absolute after:inset-0"
        >
          {home}
        </Link>
        <span className="w-full truncate type-ui-12 text-slate-500">{meta}</span>
      </span>
      <Button
        variant="outline"
        size="pill-sm"
        className="relative z-10 group-hover:border-green-500 group-hover:bg-green-500 group-hover:text-white"
      >
        Pick up
      </Button>
    </li>
  );
}
