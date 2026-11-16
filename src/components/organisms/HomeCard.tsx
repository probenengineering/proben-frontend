import Link from "next/link";

import { Icon, Separator } from "@/components/atoms";
import { HomeStat } from "@/components/molecules";
import type { AssignedHome } from "@/types/home";

// Home card in the "Section" view (Figma 51:12625): white, 16px radius, 24px padding. Name,
// address, three stats, a line, then "View home details →" which opens the profile panel.
// Figma uses the two-people icon for all three stats; kept as designed.
export interface HomeCardProps {
  home: AssignedHome;
  href: string;
}

export function HomeCard({ home, href }: HomeCardProps) {
  return (
    <article className="flex w-full flex-col gap-5 rounded-[16px] bg-white p-6">
      <div className="flex flex-col gap-3">
        <h2 className="type-title-lg font-medium text-black">{home.name}</h2>
        <p className="truncate type-paragraph-sm text-grey-700">{home.address}</p>
      </div>
      <div className="flex w-full items-center gap-5">
        <HomeStat icon="profile-2user" value={home.residents} label="Residents" />
        <HomeStat icon="profile-2user" value={home.openTasks} label="Open tasks" />
        <HomeStat
          icon="profile-2user"
          value={
            home.nextSchedule ? (
              <>
                {home.nextSchedule.day}
                <br />
                {home.nextSchedule.time}
              </>
            ) : (
              "None"
            )
          }
          label="Next Schedule"
        />
      </div>
      <Separator />
      <Link
        href={href}
        scroll={false}
        className="flex items-center justify-between px-2 type-title-md font-medium text-black-50"
      >
        View home details
        <Icon name="arrow-right-16" size={16} />
      </Link>
    </article>
  );
}
