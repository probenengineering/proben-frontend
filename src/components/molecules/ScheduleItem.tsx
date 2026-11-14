import Image from "next/image";

import type { IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

import { AddressLine } from "./AddressLine";

// One row of "Today's schedule": start/end times, a timeline (dot + 1px white-400 line), then
// home, role and address. The first row's dot sits 24px from the top; later rows draw a 24px
// line above the dot so the timeline joins up.
export interface ScheduleItemProps {
  start: string;
  end: string;
  home: string;
  role: string;
  address: string;
  addressIcon?: IconName;
  /** Green dot for the current shift, grey otherwise. */
  active?: boolean;
  first?: boolean;
}

export function ScheduleItem({
  start,
  end,
  home,
  role,
  address,
  addressIcon,
  active,
  first,
}: ScheduleItemProps) {
  return (
    <li className="flex w-full items-stretch border-b border-white-200 bg-white last:border-b-0">
      <div className="flex shrink-0 flex-col gap-2.5 pt-3 pb-6 pl-5">
        <span className="w-20 type-title-sm font-medium text-black">{start}</span>
        <span className="w-20 type-paragraph-sm text-black-50">{end}</span>
      </div>

      <div className={cn("flex shrink-0 flex-col items-center px-2.5", first && "pt-6")}>
        {!first && <span className="h-6 w-px bg-white-400" />}
        <Image
          src={active ? "/images/timeline-dot-active.svg" : "/images/timeline-dot-idle.svg"}
          width={12}
          height={12}
          alt=""
          className="shrink-0"
        />
        <span className="w-px flex-1 bg-white-400" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 pt-3 pb-3.5">
        <p className="type-title-md font-medium text-black">{home}</p>
        <p className="type-title-sm text-black-50">{role}</p>
        <AddressLine icon={addressIcon} address={address} />
      </div>
    </li>
  );
}
