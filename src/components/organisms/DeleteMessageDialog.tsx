import { Button } from "@/components/atoms";
import { MessagePreview, type MessagePreviewProps } from "@/components/molecules";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";

// Figma "Popup": "Delete Message?" confirmation (400px card, 24px radius, white-300 border)
// over a 50% black overlay. Delete removes the message (via onConfirm).
export interface DeleteMessageDialogProps {
  message: MessagePreviewProps | null;
  onOpenChange: (open: boolean) => void;
  /** Called when the main button is pressed, before the dialog closes. */
  onConfirm?: () => void;
}

export function DeleteMessageDialog({
  message,
  onOpenChange,
  onConfirm,
}: DeleteMessageDialogProps) {
  return (
    <Dialog open={message !== null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-100 flex-col items-center gap-6 rounded-[24px] border border-white-300 bg-white p-4 ring-0 sm:max-w-none"
      >
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <DialogTitle className="type-title-md font-medium text-black">
            Delete Message?
          </DialogTitle>
          <DialogDescription className="type-title-sm text-black-60">
            This will permanently delete your message.
            <br />
            This action can not be undone.
          </DialogDescription>
        </div>
        {message && <MessagePreview {...message} />}
        <div className="flex w-full items-center justify-end gap-5">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
