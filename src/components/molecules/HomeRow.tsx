import Link from "next/link";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { AssignedHome } from "@/types/home";

import { HOME_TABLE_COLUMNS } from "./HomeTableHeader";

// One home in the My Homes table: the whole 50px row links to its profile panel. Selected
// (panel open) = white-200 background (Figma 51:12782). Below sm (agreed, no Figma frame): name
// with the address under it and › on the right.
export interface HomeRowProps {
  home: AssignedHome;
  href: string;
  selected?: boolean;
  compact?: boolean;
}

export function HomeRow({ home, href, selected, compact }: HomeRowProps) {
  return (
    <li className="border-b border-white-200 last:border-b-0">
      <Link
        href={href}
        scroll={false}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex items-center type-title-md text-black transition-colors hover:bg-white-200 sm:grid",
          compact ? HOME_TABLE_COLUMNS.compact : HOME_TABLE_COLUMNS.full,
          selected ? "bg-white-200" : "bg-white",
        )}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1 py-3 pr-2 pl-5 sm:contents">
          <span className="truncate sm:py-3 sm:pr-2 sm:pl-5">{home.name}</span>
          <span className="truncate type-title-sm text-black-50 sm:px-3 sm:py-3 sm:type-title-md sm:text-black">
            {home.address}
          </span>
        </span>
        <span className="hidden px-10 pt-3 pb-3.5 sm:block">{home.residents}</span>
        <span className="hidden px-10 pt-3 pb-3.5 sm:block">{home.openTasks}</span>
        <span className="flex shrink-0 items-center justify-center self-stretch px-5 py-2">
          <Icon name="arrow-down" size={16} className="-rotate-90" />
        </span>
      </Link>
    </li>
  );
}
