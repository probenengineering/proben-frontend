import { Icon } from "@/components/atoms";
import type { ProfileHome } from "@/lib/staff-profile";
import { cn } from "@/lib/utils";

// An assigned home (Figma "Home Select Row", Assigned 103:18101 / Removed 103:18110): slate-200
// border, 12px radius, 14 × 12 padding, 12px gaps. 36px green-500/12 tile (10px radius) with the
// 18px house; name Inter Semi Bold 14/20 slate-900 over code · address (12/17 slate-500); on the
// right "Assigned Mar 6, 2025" (12/17 slate-500) over "Remove" (Semi Bold 13/18 danger-600).
// `removing` (in the Assign homes drawer): danger-50 fill, dashed danger-200 border, name and
// address in slate-500, "Will be removed" (Medium 12/17 danger-600) over "Undo" (Semi Bold 13/18
// green-ink). Without `onRemove` (no permission to change homes) the Remove link is left out.
export interface AssignedHomeRowProps {
  home: ProfileHome;
  onRemove?: () => void;
  removing?: boolean;
  onUndo?: () => void;
}

export function AssignedHomeRow({ home, onRemove, removing, onUndo }: AssignedHomeRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-[12px] border px-3.5 py-3",
        removing ? "border-dashed border-danger-200 bg-danger-50" : "border-slate-200 bg-white",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-green-500/12">
        <Icon name="home-tile-18" size={18} />
      </span>
      <div className={cn("flex min-w-0 flex-1 flex-col", removing && "text-slate-500")}>
        <p className={cn("truncate type-ui-14 font-semibold", !removing && "text-slate-900")}>
          {home.name}
        </p>
        <p className={cn("truncate type-ui-12-17", !removing && "text-slate-500")}>{home.detail}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {removing ? (
          <>
            <span className="type-ui-12-17 font-medium text-danger-600">Will be removed</span>
            <button
              type="button"
              onClick={onUndo}
              className="type-ui-13 font-semibold text-green-ink hover:underline"
            >
              Undo
            </button>
          </>
        ) : (
          <>
            <span className="type-ui-12-17 text-slate-500">{home.assignedOn}</span>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="type-ui-13 font-semibold text-danger-600 hover:underline"
              >
                Remove
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
