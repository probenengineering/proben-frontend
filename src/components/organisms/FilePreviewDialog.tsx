"use client";

import { Button, Icon } from "@/components/atoms";
import { DrawerIconButton, fileHref } from "@/components/molecules";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui";
import type { HomeResource } from "@/types/home";

// File preview (Figma "Document preview" 60:14744): 760 × 820 (shrinks to the window), 20px radius,
// preview shadow, over a slate-900/40 scrim. Header (20 × 14 padding, slate-200 divider): 20px file
// icon, name (Inter Semi Bold 15/22) over "Updated Oct 2, 2026 · 1.2 MB" (12/18 slate-500), a
// Download pill and the close button. Below, a slate-100 area with the PDF (browser viewer) or the
// image, loaded from /api/files/<id>?inline=1.
export interface FilePreviewDialogProps {
  resource: HomeResource | null;
  onClose: () => void;
}

export function FilePreviewDialog({ resource: r, onClose }: FilePreviewDialogProps) {
  return (
    <Dialog open={!!r} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex h-205 max-h-[calc(100%-2rem)] w-190 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-clip rounded-[20px] bg-white p-0 shadow-preview ring-0 sm:max-w-190"
      >
        {r && (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
              <Icon name="file-pdf-20" size={20} />
              <div className="flex min-w-0 flex-1 flex-col">
                <DialogTitle className="truncate type-ui-15 font-semibold text-slate-900">
                  {r.name}
                </DialogTitle>
                <p className="type-ui-12 text-slate-500">
                  {["Updated " + r.updated, r.size].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Button
                variant="outline"
                size="pill-sm"
                className="h-8.5 px-3 type-ui-13-20 focus-visible:bg-slate-50 focus-visible:ring-0"
                render={<a href={fileHref(r)} />}
                nativeButton={false}
              >
                Download
              </Button>
              <DrawerIconButton icon="close-18" label="Close preview" onClick={onClose} />
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100 py-6">
              {r.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element -- streamed private file
                <img
                  src={fileHref(r, true)}
                  alt={r.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <iframe
                  title={r.name}
                  src={fileHref(r, true)}
                  className="h-full w-full max-w-160 bg-white"
                />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
