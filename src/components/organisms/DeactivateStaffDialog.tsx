"use client";

import { Button, Icon } from "@/components/atoms";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";
import { cn } from "@/lib/utils";

// "Deactivate Grace Okafor?" (Figma "Modal" 103:19396): 480px, 24px radius, modal shadow, 28px
// padding (24px bottom), 20px gaps, slate-900/40 scrim. 48px red warning badge; title Inter Semi
// Bold 20/28 over the message (14/20 slate-500); a slate-50 list (14px radius, 16 × 14 padding,
// 10px gaps) of what happens: 6px dots, Inter 13/18, the first in danger-600 and the rest
// grey-700; then Cancel (outline) and Deactivate (danger-600), equal width, 12px apart.
export interface DeactivateStaffDialogProps {
  name: string;
  homes: number;
  openTasks: number;
  open: boolean;
  /** While the deactivation is saving: both buttons are disabled. */
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function DeactivateStaffDialog({
  name,
  homes,
  openTasks,
  open,
  pending,
  onOpenChange,
  onConfirm,
}: DeactivateStaffDialogProps) {
  const points = [
    "Sign-in access is removed immediately",
    `${plural(homes, "home assignment stays", "home assignments stay")} on record`,
    `${plural(openTasks, "open task stays", "open tasks stay")} assigned until you reassign ${openTasks === 1 ? "it" : "them"}`,
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-120 max-w-[calc(100%-2rem)] flex-col gap-5 rounded-[24px] bg-white px-7 pt-7 pb-6 shadow-modal ring-0 sm:max-w-120"
      >
        <Icon name="warning-48" size={48} />
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="type-ui-20 font-semibold text-slate-900">
            Deactivate {name}?
          </DialogTitle>
          <DialogDescription className="type-ui-14 text-slate-500">
            They will lose access to ProBen right away. Their records, home assignments, and task
            history are kept.
          </DialogDescription>
        </div>
        <ul className="flex flex-col gap-2.5 rounded-[14px] bg-slate-50 px-4 py-3.5">
          {points.map((point, i) => (
            <li
              key={point}
              className={cn(
                "flex items-center gap-2.5 type-ui-13",
                i === 0 ? "text-danger-600" : "text-grey-700",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  i === 0 ? "bg-danger-600" : "bg-grey-400",
                )}
              />
              {point}
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="pill-lg"
            className="flex-1"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="pill-lg"
            className="flex-1 bg-danger-600 hover:bg-danger-600/90"
            disabled={pending}
            onClick={onConfirm}
          >
            Deactivate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
