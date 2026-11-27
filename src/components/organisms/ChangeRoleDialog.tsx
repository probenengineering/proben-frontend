"use client";

import { Button, Icon, RoleTag } from "@/components/atoms";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";
import type { StaffRole } from "@/lib/staff-roles";

// "Change role to Home Manager?" (Figma "Modal" 103:19571): 480px, 24px radius, modal shadow,
// 28px padding (24px bottom), 20px gaps, slate-900/40 scrim. Title Semi Bold 20/28 over the
// message (14/20 slate-500); slate-50 box (14px radius, 16 × 14) with old role tag → new role tag
// (green-500/16); "Gains access to" (Semi Bold 13/18 grey-700) with green + rows (13/18 grey-700,
// 8px gaps); Cancel (outline) and Change role (green), equal width. Losses (no Figma frame) are
// listed as "Loses access to" with grey ✕ rows. Gains and losses are the actual permission diff
// (catalogue labels); past six, the rest are summed up as "and 4 more".
export interface ChangeRoleDialogProps {
  name: string;
  /** The role(s) they hold now. */
  from: string[];
  to: StaffRole;
  gains: string[];
  loses: string[];
  /** Where the role applies, e.g. "for their 4 homes", added to the message. */
  scopeNote?: string;
  saving?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const SHOWN = 6;

function Changes({
  title,
  lines,
  icon,
}: {
  title: string;
  lines: string[];
  icon: "plus-green-16" | "perm-off-18";
}) {
  if (lines.length === 0) return null;
  const more = lines.length - SHOWN;
  return (
    <div className="flex flex-col gap-2">
      <p className="type-ui-13 font-semibold text-grey-700">{title}</p>
      {lines.slice(0, more > 1 ? SHOWN : lines.length).map((line) => (
        <p key={line} className="flex items-center gap-2 type-ui-13 text-grey-700">
          <Icon name={icon} size={16} />
          {line}
        </p>
      ))}
      {more > 1 && <p className="pl-6 type-ui-13 text-slate-500">and {more} more</p>}
    </div>
  );
}

export function ChangeRoleDialog({
  name,
  from,
  to,
  gains,
  loses,
  scopeNote,
  saving,
  open,
  onOpenChange,
  onConfirm,
}: ChangeRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-120 max-w-[calc(100%-2rem)] flex-col gap-5 rounded-[24px] bg-white px-7 pt-7 pb-6 shadow-modal ring-0 sm:max-w-120"
      >
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="type-ui-20 font-semibold text-slate-900">
            Change role to {to.name}?
          </DialogTitle>
          <DialogDescription className="type-ui-14 text-slate-500">
            {name}’s access will change right away{scopeNote ? `, ${scopeNote}` : ""}. They will be
            notified of the update.
          </DialogDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 rounded-[14px] bg-slate-50 px-4 py-3.5">
          {from.map((role) => (
            <RoleTag key={role}>{role}</RoleTag>
          ))}
          <Icon name="arrow-grey-16" size={16} />
          <span className="rounded-[6px] bg-green-500/16 px-2 py-0.5 type-ui-12-17 font-medium text-grey-700">
            {to.name}
          </span>
        </div>
        <Changes title="Gains access to" lines={gains} icon="plus-green-16" />
        <Changes title="Loses access to" lines={loses} icon="perm-off-18" />
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="pill-lg"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="green"
            size="pill-lg"
            className="flex-1"
            disabled={saving}
            onClick={onConfirm}
          >
            {saving ? "Changing…" : "Change role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
