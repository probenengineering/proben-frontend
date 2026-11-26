import { Button, InitialsAvatar } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { HomeShift } from "@/types/home";

// A shift on the Home schedule tab (Figma "Shift / …" 60:14195): 16 × 14 padding, 16px gaps,
// slate-200 divider. 3 × 40 bar (green-500; caution-500 when short-staffed), time (Inter Semi
// Bold 14/20) over the shift name (12/18 slate-500), overlapping 32px avatars (2px white ring,
// −8px), names (13/18 grey-700), then the staffing note (Medium 13/18): "Staffed · 2 of 2"
// (verified-700), "1 of 2 · needs 1 more" (caution-700, with a green "Pick up shift"), or "Your
// shift · in progress" (green-ink). Yours (60:14208): green-tint with a 3px green-500 left edge.
// Phones: the names hide (avatars stay) and the note wraps under the time.
export interface ShiftRowProps {
  shift: HomeShift;
  onPickUp?: () => void;
  pending?: boolean;
}

export function ShiftRow({ shift: s, onPickUp, pending }: ShiftRowProps) {
  const short = s.needed !== undefined && s.filled < s.needed;
  const note = s.mine
    ? `Your shift${s.inProgress ? " · in progress" : ""}`
    : s.needed === undefined
      ? undefined
      : short
        ? `${s.filled} of ${s.needed} · needs ${s.needed - s.filled} more`
        : `Staffed · ${s.filled} of ${s.needed}`;
  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-4 border-b border-slate-200 px-4 py-3.5 last:border-b-0",
        s.mine ? "bg-green-tint shadow-[inset_3px_0_0_var(--color-green-500)]" : "bg-white",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-10 w-0.75 shrink-0 rounded-[2px]",
          short ? "bg-caution-500" : "bg-green-500",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 md:w-50 md:flex-none">
        <span className="type-ui-14 font-semibold text-slate-900">{s.time}</span>
        {s.title && <span className="type-ui-12 text-slate-500">{s.title}</span>}
      </span>
      {s.staff.length > 0 && (
        <span className="flex">
          {s.staff.slice(0, 3).map((name, i) => (
            <InitialsAvatar key={name} name={name} ring className={i > 0 ? "-ml-2" : undefined} />
          ))}
        </span>
      )}
      <span className="hidden min-w-0 flex-1 truncate type-ui-13 text-grey-700 sm:block">
        {s.staff.length ? s.staff.join(", ") : "No one assigned yet"}
      </span>
      {note && (
        <span
          className={cn(
            "type-ui-13 font-medium",
            s.mine ? "text-green-ink" : short ? "text-caution-700" : "text-verified-700",
          )}
        >
          {note}
        </span>
      )}
      {short && !s.mine && onPickUp ? (
        <Button
          variant="green"
          size="pill-sm"
          className="h-8 px-3 type-ui-13-20"
          disabled={pending}
          onClick={onPickUp}
        >
          Pick up shift
        </Button>
      ) : (
        <span className="hidden w-25.5 md:block" />
      )}
    </li>
  );
}
