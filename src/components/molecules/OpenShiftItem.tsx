import Link from "next/link";

import { Icon } from "@/components/atoms";

import { AddressLine } from "./AddressLine";

// One open shift: date and hours, a full-height 1px divider, then home, address and a › arrow.
export interface OpenShiftItemProps {
  date: string;
  hours: string;
  home: string;
  address: string;
  href?: string;
}

export function OpenShiftItem({ date, hours, home, address, href = "#" }: OpenShiftItemProps) {
  return (
    <li className="w-full border-b border-white-200 bg-white last:border-b-0">
      {/* Below sm (agreed, not in Figma): date and hours sit above the details, no divider. */}
      <Link href={href} className="flex w-full flex-col sm:flex-row sm:items-stretch">
        <div className="flex shrink-0 flex-col gap-2.5 pt-3 pr-3 pl-5 sm:pb-6">
          <span className="type-title-sm font-medium whitespace-nowrap text-black sm:w-20 sm:whitespace-normal">
            {date}
          </span>
          <span className="type-paragraph-sm whitespace-nowrap text-black-50">{hours}</span>
        </div>

        <div className="hidden w-8 shrink-0 justify-center sm:flex">
          <span className="w-px bg-white-400" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 pt-3 pb-3.5">
          <div className="flex w-full items-center justify-between gap-2">
            <p className="type-title-md font-medium text-black">{home}</p>
            <Icon name="arrow-down" size={16} className="-rotate-90" />
          </div>
          <AddressLine address={address} />
        </div>
      </Link>
    </li>
  );
}
