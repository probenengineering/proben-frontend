import { Icon, StatePill, type StatePillTone } from "@/components/atoms";
import { type Coverage, COVERAGE_LABELS, type HomeAssignment } from "@/lib/home-assignments";
import { cn } from "@/lib/utils";

import { AvatarStack } from "./AvatarStack";
import { HOME_ASSIGNMENT_COLUMNS as C } from "./HomeAssignmentTableHeader";

// One home in Home assignments (Figma "Row / Becharbum Group Home" 103:20887): white, slate-200
// divider, 16 × 12 padding, 16px gaps. 40px green-500/12 tile (12px radius) with a 20px house;
// name Semi Bold 14/20 slate-900 over the code (12/17 slate-500); city (13/18 grey-700); the
// avatar stack; manager (13/18 grey-700, "Not assigned" in grey-400); coverage pill (Covered
// green, the others amber); "Manage" (Semi Bold 13/18 green-ink).
export interface HomeAssignmentRowProps {
  home: HomeAssignment;
  onManage: (home: HomeAssignment) => void;
}

const TONES: Record<Coverage, StatePillTone> = {
  covered: "success",
  "no-manager": "warning",
  "one-staff": "warning",
};

export function HomeAssignmentRow({ home, onManage }: HomeAssignmentRowProps) {
  return (
    <li className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-slate-50/70 md:gap-4">
      <span className={cn("flex items-center gap-3", C.home)}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-green-500/12">
          <Icon name="house-green-20" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate type-ui-14 font-semibold text-slate-900">{home.name}</span>
          {home.code && <span className="type-ui-12-17 text-slate-500">{home.code}</span>}
        </span>
      </span>
      <span className={cn("type-ui-13", home.city ? "text-grey-700" : "text-grey-400", C.city)}>
        {home.city || "No address"}
      </span>
      <span className={cn("items-center", C.staff)}>
        <AvatarStack people={home.staff} count={home.staffCount} />
      </span>
      <span
        className={cn("type-ui-13", home.manager ? "text-grey-700" : "text-grey-400", C.manager)}
      >
        {home.manager ?? "Not assigned"}
      </span>
      <span className={cn("items-center", C.coverage)}>
        <StatePill tone={TONES[home.coverage]}>{COVERAGE_LABELS[home.coverage]}</StatePill>
      </span>
      <span className={C.actions}>
        <button
          type="button"
          onClick={() => onManage(home)}
          aria-label={`Manage ${home.name}`}
          className="type-ui-13 font-semibold text-green-ink hover:underline"
        >
          Manage
        </button>
      </span>
    </li>
  );
}
