"use client";

import { Button, Icon, SourceTag } from "@/components/atoms";
import { DetailRow, DrawerFooter, DrawerIconButton } from "@/components/molecules";
import { SheetTitle } from "@/components/ui";
import type { TaskTableItem } from "@/types/task-table";

// Task drawer, submitted (Figma 60:12071): source tag + close; a 72px verified-50 circle with the
// 40px tick, "Task submitted" (Inter Semi Bold 22/30) and "<task> moved to Finished." (14/22
// slate-500); then Submitted / File / Status ("Completed", verified-700). Footer: View in Finished
// and Back to tasks.
export interface TaskSubmittedViewProps {
  task: TaskTableItem;
  /** "Oct 25, 2026 · 10:52 AM". */
  submittedAt: string;
  fileName?: string;
  onClose: () => void;
  onViewFinished: () => void;
}

export function TaskSubmittedView({
  task,
  submittedAt,
  fileName,
  onClose,
  onViewFinished,
}: TaskSubmittedViewProps) {
  const rows = [
    { label: "Submitted", value: submittedAt },
    ...(fileName ? [{ label: "File", value: fileName }] : []),
    { label: "Status", value: "Completed", valueClassName: "text-verified-700" },
  ];
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 pt-5 pb-6">
        <div className="flex items-center gap-2">
          {task.source && <SourceTag source={task.source} />}
          <span className="flex-1" />
          <DrawerIconButton icon="close-18" label="Close" onClick={onClose} />
        </div>

        <div className="flex flex-col items-center gap-3 pt-10 pb-2 text-center">
          <span className="flex size-18 items-center justify-center rounded-full bg-verified-50">
            <Icon name="success-check-40" size={40} />
          </span>
          <SheetTitle className="type-ui-22 font-semibold text-slate-900">
            Task submitted
          </SheetTitle>
          <p className="type-ui-14 leading-5.5 text-slate-500">{task.title} moved to Finished.</p>
        </div>

        <dl className="flex flex-col overflow-clip rounded-[12px] border border-slate-200">
          {rows.map((row, i) => (
            <DetailRow key={row.label} {...row} divider={i < rows.length - 1} />
          ))}
        </dl>
      </div>

      <DrawerFooter>
        <Button variant="outline" size="pill" className="h-11 px-4.5" onClick={onViewFinished}>
          View in Finished
        </Button>
        <Button variant="green" size="pill" className="h-10.5 flex-1 px-4.5" onClick={onClose}>
          Back to tasks
        </Button>
      </DrawerFooter>
    </>
  );
}
