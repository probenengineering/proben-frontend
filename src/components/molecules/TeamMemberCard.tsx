import Link from "next/link";

import { Icon, InitialsAvatar } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { HomeTeamMember } from "@/types/home";

// Person card on the Home team tab (Figma "Member / …" 60:14000): white, slate-200 border, 14px
// radius, 16px padding, 12px gaps. 44px avatar + name (Inter Semi Bold 14/20) over role (12/18
// slate-500); the shift status (8px dot + Medium 13/18: success / info / neutral); then Message
// (34px outline pill) and a 32px round call button. Yours (60:14016): green-tint, green-500
// border, "· You" after the role and "This is you" (Medium 13 green-ink) instead of the buttons.
const TONES = {
  success: { dot: "bg-verified-500", text: "text-verified-700" },
  info: { dot: "bg-info-500", text: "text-info-700" },
  neutral: { dot: "bg-grey-400", text: "text-slate-500" },
};

export interface TeamMemberCardProps {
  member: HomeTeamMember;
}

export function TeamMemberCard({ member: m }: TeamMemberCardProps) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-[14px] border p-4",
        m.isYou ? "border-green-500 bg-green-tint" : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-center gap-3">
        <InitialsAvatar name={m.name} size={44} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate type-ui-14 font-semibold text-slate-900">{m.name}</p>
          {(m.role || m.isYou) && (
            <p className="type-ui-12 text-slate-500">
              {[m.role, m.isYou && "You"].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
      {m.shift && (
        <p
          className={cn(
            "flex items-center gap-1.5 type-ui-13 font-medium",
            TONES[m.shift.tone].text,
          )}
        >
          <span aria-hidden className={cn("size-2 rounded-full", TONES[m.shift.tone].dot)} />
          {m.shift.label}
        </p>
      )}
      {m.isYou ? (
        <p className="flex h-8 items-center type-ui-13 font-medium text-green-ink">This is you</p>
      ) : (
        <div className="mt-auto flex gap-2">
          <Link
            href="/messages"
            className="flex h-8.5 flex-1 items-center justify-center rounded-full border border-grey-300 bg-white type-ui-13-20 font-semibold text-grey-700 hover:bg-slate-50"
          >
            Message
          </Link>
          {m.phone && (
            <a
              href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}
              aria-label={`Call ${m.name}`}
              className="flex size-8.5 items-center justify-center rounded-full border border-grey-300 bg-white hover:bg-slate-50"
            >
              <Icon name="phone-16" size={16} />
            </a>
          )}
        </div>
      )}
    </li>
  );
}
