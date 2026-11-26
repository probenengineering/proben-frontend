"use client";

import { Button, Icon, StatePill, TypeTag } from "@/components/atoms";
import { DetailRow, STATUS_PILL } from "@/components/molecules";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui";
import type { ScheduleItem } from "@/types/schedule";

// Task detail drawer (Figma 60:6907): 460px floating panel (10px from the edges, 24px radius) over
// a 24% slate-900 scrim. Type tag + close, title (Inter Semi Bold 22/30) + status, a details
// table, the description, then Reschedule / Mark as complete. Location, Assigned by and the
// checklist aren't in the API yet, so they're left out (docs/command-center.md R26).
export interface ScheduleDetailPanelProps {
  item: ScheduleItem | null;
  onClose: () => void;
  onComplete: (item: ScheduleItem) => void;
  /** True while "Mark as complete" is saving. */
  pending?: boolean;
}

export function ScheduleDetailPanel({
  item,
  onClose,
  onComplete,
  pending,
}: ScheduleDetailPanelProps) {
  const rows = item
    ? [
        { label: "Date", value: item.dateLabel },
        { label: "Time", value: item.timeDetail },
        ...(item.home ? [{ label: "Home", value: item.home }] : []),
      ]
    : [];

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/24 supports-backdrop-filter:backdrop-blur-none"
        className="gap-0 rounded-[24px] border-0 bg-white p-0 shadow-drawer data-[side=right]:inset-y-2.5 data-[side=right]:right-2.5 data-[side=right]:h-auto data-[side=right]:w-115 data-[side=right]:max-w-[calc(100%-1.25rem)] data-[side=right]:border-l-0 data-[side=right]:sm:max-w-115"
      >
        {item && (
          <>
            <div className="flex items-center gap-2 pt-5 pr-5 pb-3 pl-6">
              <TypeTag label={item.type.label} tone={item.type.tone} />
              <SheetClose
                aria-label="Close"
                className="ml-auto flex size-9 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100"
              >
                <Icon name="close-18" size={18} />
              </SheetClose>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pt-1 pb-6">
              <div className="flex flex-col items-start gap-2.5">
                <SheetTitle className="type-ui-22 font-semibold text-slate-900">
                  {item.title}
                </SheetTitle>
                <StatePill tone={STATUS_PILL[item.status].tone}>
                  {STATUS_PILL[item.status].label}
                </StatePill>
              </div>

              <dl className="flex w-full flex-col overflow-clip rounded-[12px] border border-slate-200">
                {rows.map((row, i) => (
                  <DetailRow key={row.label} {...row} divider={i < rows.length - 1} />
                ))}
              </dl>

              {item.description && (
                <div className="flex flex-col gap-2">
                  <h3 className="type-ui-14 font-semibold text-slate-900">Description</h3>
                  <p className="type-ui-14 leading-5.5 whitespace-pre-line text-slate-500">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-200 px-6 pt-4 pb-5">
              {/* No reschedule endpoint yet. */}
              <Button variant="outline" size="pill" className="flex-1 px-4">
                Reschedule
              </Button>
              {item.status !== "completed" && item.canComplete && (
                <Button
                  variant="green"
                  size="pill"
                  className="flex-1 px-4"
                  disabled={pending}
                  onClick={() => onComplete(item)}
                >
                  Mark as complete
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
