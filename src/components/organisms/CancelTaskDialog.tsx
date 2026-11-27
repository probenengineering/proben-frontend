"use client";

import { Button, Icon } from "@/components/atoms";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";

// "Cancel this task?" before POST /admin/tasks/{id}/cancel. No Figma frame: it reuses the
// Deactivate staff modal (103:19396): 480px, 24px radius, modal shadow, 28px padding (24px
// bottom), 20px gaps, slate-900/40 scrim, 48px warning badge, title Semi Bold 20/28 over the
// message (14/20 slate-500), then Keep task (outline) and Cancel task (danger-600), equal width.
export interface CancelTaskDialogProps {
  /** The task to cancel; null = closed. */
  task: { title: string; assignee: { name: string } } | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelTaskDialog({
  task,
  pending,
  onOpenChange,
  onConfirm,
}: CancelTaskDialogProps) {
  const first = task?.assignee.name.split(" ")[0];
  return (
    <Dialog open={!!task} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-120 max-w-[calc(100%-2rem)] flex-col gap-5 rounded-[24px] bg-white px-7 pt-7 pb-6 shadow-modal ring-0 sm:max-w-120"
      >
        <Icon name="warning-48" size={48} />
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="type-ui-20 font-semibold text-slate-900">
            Cancel “{task?.title}”?
          </DialogTitle>
          <DialogDescription className="type-ui-14 text-slate-500">
            {first} will no longer need to do it. The task stays on the list as Cancelled and can’t
            be reopened.
          </DialogDescription>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="pill-lg"
            className="flex-1"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Keep task
          </Button>
          <Button
            variant="destructive"
            size="pill-lg"
            className="flex-1 bg-danger-600 hover:bg-danger-600/90"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Cancelling…" : "Cancel task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
