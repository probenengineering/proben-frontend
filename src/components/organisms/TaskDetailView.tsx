"use client";

import { Button, PriorityLabel, SourceTag, sourceLabel, StatePill } from "@/components/atoms";
import {
  AlertBanner,
  DetailRow,
  DraftProgressCard,
  DrawerFooter,
  DrawerIconButton,
  TASK_STATUS,
  TaskAttachments,
} from "@/components/molecules";
import { SheetTitle } from "@/components/ui";
import type { FileInfo } from "@/lib/command-center/task-actions";
import { requiredProgress } from "@/lib/task-form";
import { cn } from "@/lib/utils";
import type { TaskTableItem } from "@/types/task-table";

// Task drawer, details (Figma 60:11766): source tag + priority + close; title (Inter Semi Bold
// 22/30) with the status pill and "Due Oct 28 · in 3 days"; the Assigned / Due date / Source
// table; Description; Attachments. Footer: View attachments (when there are any) and the main
// action: Start task (form fields), Continue task (started), or Mark as complete (no fields).
// Rows the API has no data for yet (assigned by, required action, duration, instructions) are
// left out. Overdue (60:12169): a red alert on top, "Was due Oct 22, 2026" and a red due date.
// A started task with a saved draft (60:12297) shows the required-fields progress card.
export interface TaskDetailViewProps {
  task: TaskTableItem;
  files: FileInfo[];
  online: boolean;
  pending: boolean;
  onClose: () => void;
  onStart: () => void;
  onComplete: () => void;
  onRetryFile: (id: string) => void;
}

const DUE_TONE = {
  overdue: "text-danger-700",
  soon: "text-caution-700",
  later: "text-slate-500",
};

export function TaskDetailView({
  task,
  files,
  online,
  pending,
  onClose,
  onStart,
  onComplete,
  onRetryFile,
}: TaskDetailViewProps) {
  const done = task.status === "completed";
  const overdue = !done && task.dueTone === "overdue";
  const progress = requiredProgress(task.fields, task.answers);
  const rows = [
    ...(task.assignedDate ? [{ label: "Assigned", value: task.assignedDate }] : []),
    ...(task.dueDate
      ? [
          {
            label: "Due date",
            value: task.dueDate,
            valueClassName: overdue ? "text-danger-700" : undefined,
          },
        ]
      : []),
    ...(task.source ? [{ label: "Source", value: sourceLabel(task.source) }] : []),
  ];
  const hasForm = task.fields.length > 0;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 pt-5 pb-6">
        <div className="flex items-center gap-2">
          {task.source && <SourceTag source={task.source} />}
          {!done && <PriorityLabel priority={task.priority} />}
          <span className="flex-1" />
          <DrawerIconButton icon="close-18" label="Close" onClick={onClose} />
        </div>

        {overdue && task.dueRelative && (
          <AlertBanner
            title={task.dueRelative}
            message={`This task was due ${task.dueDate?.split(",")[0]}. Complete it as soon as possible to stay compliant.`}
          />
        )}

        <div className="flex flex-col gap-2.5">
          <SheetTitle className="type-ui-22 font-semibold text-slate-900">{task.title}</SheetTitle>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatePill tone={TASK_STATUS[task.status].tone}>
              {TASK_STATUS[task.status].label}
            </StatePill>
            {!done && task.dueDate && (
              <span className={cn("type-ui-13 font-medium", DUE_TONE[task.dueTone])}>
                {overdue
                  ? `Was due ${task.dueDate}`
                  : `Due ${task.dueDate.split(",")[0]}${task.dueRelative ? ` · ${task.dueRelative.toLowerCase()}` : ""}`}
              </span>
            )}
          </div>
        </div>

        {!done && task.draftSavedAt && progress.total > 0 && (
          <DraftProgressCard {...progress} savedAt={task.draftSavedAt} />
        )}

        {rows.length > 0 && (
          <dl className="flex flex-col overflow-clip rounded-[12px] border border-slate-200">
            {rows.map((row, i) => (
              <DetailRow key={row.label} {...row} divider={i < rows.length - 1} />
            ))}
          </dl>
        )}

        {task.item.description && (
          <section className="flex flex-col gap-2.5">
            <h3 className="type-ui-14 font-semibold text-slate-900">Description</h3>
            <p className="type-ui-14 leading-5.5 whitespace-pre-line text-slate-500">
              {task.item.description}
            </p>
          </section>
        )}

        {files.length > 0 && <TaskAttachments files={files} onRetry={onRetryFile} />}
      </div>

      {(!done || files.length > 0) && (
        <DrawerFooter>
          {files.length > 0 && (
            <Button
              variant="outline"
              size="pill"
              className="h-11 px-4.5"
              onClick={() =>
                document.getElementById("task-attachments")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View attachments
            </Button>
          )}
          {!done && (
            <Button
              variant="green"
              size="pill"
              className="h-10.5 flex-1 px-4.5"
              disabled={!online || pending}
              onClick={hasForm ? onStart : onComplete}
            >
              {hasForm ? (task.started ? "Continue task" : "Start task") : "Mark as complete"}
            </Button>
          )}
        </DrawerFooter>
      )}
    </>
  );
}
