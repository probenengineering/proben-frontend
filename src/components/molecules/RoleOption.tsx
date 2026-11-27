import { Icon, RadioDot, ScopeBadge } from "@/components/atoms";
import type { StaffRole } from "@/lib/staff-roles";
import { cn } from "@/lib/utils";

// Figma "Role Card" (103:18138 default, 103:18157 selected, 103:18176 locked): 16px padding, 14px
// radius, 10px gaps. Top row (12px gaps): radio (or a 20px lock), name Inter Semi Bold 15/21
// slate-900 over the description (13/18 slate-500; "Current role · …" for their role), and the
// scope badge. Then three ticked capabilities (14px green tick, 12/17 grey-700; 6 × 16 gaps,
// 32px indent). Selected: green-500/10 fill. Locked (the API says you can't give this role):
// everything grey-400, not selectable, with why underneath (Medium 12/17 slate-500).
export interface RoleOptionProps {
  role: StaffRole;
  selected: boolean;
  current: boolean;
  locked: boolean;
  /** Shown under a locked role; defaults to "You can't assign this role." */
  lockedReason?: string;
  onSelect: () => void;
}

export function RoleOption({
  role,
  selected,
  current,
  locked,
  lockedReason,
  onSelect,
}: RoleOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={locked || undefined}
      onClick={() => !locked && onSelect()}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-[14px] p-4 text-left transition-colors",
        selected ? "bg-green-500/10" : !locked && "hover:bg-slate-50",
        locked && "cursor-not-allowed",
      )}
    >
      <span className="flex w-full flex-wrap items-center gap-3">
        {locked ? <Icon name="lock-20" /> : <RadioDot checked={selected} />}
        {/* Phones: the text takes the row beside the radio and the scope badge wraps below it. */}
        <span
          className={cn(
            "flex min-w-0 flex-1 basis-[calc(100%-2rem)] flex-col sm:basis-0",
            locked && "text-grey-400",
          )}
        >
          <span className={cn("type-ui-15-21 font-semibold", !locked && "text-slate-900")}>
            {role.name}
          </span>
          <span className={cn("type-ui-13 whitespace-pre-wrap", !locked && "text-slate-500")}>
            {current ? `Current role  ·  ${role.description}` : role.description}
          </span>
        </span>
        <span className="max-sm:pl-8">
          <ScopeBadge tone={locked ? "muted" : selected ? "selected" : "default"}>
            {role.scope}
          </ScopeBadge>
        </span>
      </span>
      <span
        className={cn(
          "flex flex-wrap gap-x-4 gap-y-1.5 pl-8",
          !role.capabilities.length && "hidden",
        )}
      >
        {role.capabilities.map((c) => (
          <span key={c} className="flex items-center gap-1.5">
            <Icon name={locked ? "tick-muted-14" : "tick-green-14"} size={14} />
            <span className={cn("type-ui-12-17", locked ? "text-grey-400" : "text-grey-700")}>
              {c}
            </span>
          </span>
        ))}
      </span>
      {locked && (
        <span className="pl-8 type-ui-12-17 font-medium text-slate-500">
          {lockedReason ?? "You can’t assign this role."}
        </span>
      )}
    </button>
  );
}
