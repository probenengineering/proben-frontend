"use client";

import { Button, Icon } from "@/components/atoms";
import { ChangeSummaryRow } from "@/components/molecules";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";

// "Review changes" (Figma "Modal" 103:20010): 480px, 24px radius, modal shadow, 28px padding
// (24px bottom), 18px gaps, slate-900/40 scrim. Title Semi Bold 20/28 over "name · role" (14/20
// slate-500); slate-50 summary (14px radius, 16 × 4) of added / kept / removed homes; an info-50
// note (10px radius, 12 × 10, 8px gap, 16px blue icon, Inter 13/18 info-700) shown when homes are
// removed; then Back (outline) and Confirm assignment (green).
export interface ReviewHomeChangesDialogProps {
  open: boolean;
  name: string;
  role: string;
  added: string[];
  kept: string[];
  removed: string[];
  /** While the change is saving: both buttons are disabled. */
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ReviewHomeChangesDialog({
  open,
  name,
  role,
  added,
  kept,
  removed,
  pending,
  onOpenChange,
  onConfirm,
}: ReviewHomeChangesDialogProps) {
  const firstName = name.split(" ")[0];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-120 max-w-[calc(100%-2rem)] flex-col gap-4.5 rounded-[24px] bg-white px-7 pt-7 pb-6 shadow-modal ring-0 sm:max-w-120"
      >
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="type-ui-20 font-semibold text-slate-900">
            Review changes
          </DialogTitle>
          <DialogDescription className="type-ui-14 whitespace-pre text-slate-500">
            {`${name}  ·  ${role}`}
          </DialogDescription>
        </div>
        <div className="flex flex-col rounded-[14px] bg-slate-50 px-4 py-1">
          <ChangeSummaryRow label="Homes added" homes={added} tone="added" divider />
          <ChangeSummaryRow label="Assignments kept" homes={kept} tone="kept" divider />
          <ChangeSummaryRow label="Assignments removed" homes={removed} tone="removed" />
        </div>
        {removed.length > 0 && (
          <p className="flex items-start gap-2 rounded-[10px] bg-info-50 px-3 py-2.5 type-ui-13 text-info-700">
            <Icon name="info-blue-16" size={16} />
            <span className="min-w-0 flex-1">
              Removing a home doesn’t delete the home, the staff record, or any past tasks and
              records. {firstName} will be notified.
            </span>
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="pill-lg"
            className="flex-1"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Back
          </Button>
          <Button
            variant="green"
            size="pill-lg"
            className="flex-1"
            disabled={pending}
            onClick={onConfirm}
          >
            Confirm assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
