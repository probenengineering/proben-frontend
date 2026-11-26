import Link from "next/link";

import { TeamMember } from "@/components/molecules";
import type { HomeTeamMember } from "@/types/home";

// Home team card on the home detail page (Figma "Home team" 60:13908): white, slate-200 border,
// 14px radius, 16 × 14 padding, 10px gaps. "Home team" (Inter Semi Bold 15/22) and "View all · 8"
// (Semi Bold 13/18 green-ink, opens the Home team tab), then the first three members.
export interface HomeTeamCardProps {
  team: HomeTeamMember[];
  /** The Home team tab. */
  href: string;
}

export function HomeTeamCard({ team, href }: HomeTeamCardProps) {
  return (
    <section className="flex flex-col gap-2.5 rounded-[14px] border border-slate-200 bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-ui-15 font-semibold text-slate-900">Home team</h2>
        {team.length > 0 && (
          <Link
            href={href}
            scroll={false}
            className="type-ui-13 font-semibold text-green-ink hover:underline"
          >
            View all · {team.length}
          </Link>
        )}
      </div>
      {team.length === 0 ? (
        <p className="type-ui-13 text-slate-500">No team members yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {team.slice(0, 3).map((m) => (
            <TeamMember key={m.id} name={m.name} role={m.role} />
          ))}
        </ul>
      )}
    </section>
  );
}
