"use client";

import { Button, StatePill } from "@/components/atoms";
import { AlertBanner, DrawerFooter, DrawerIconButton, TaskFormField } from "@/components/molecules";
import { SheetTitle } from "@/components/ui";
import { type DraftState, type UploadedFile, useTaskForm } from "@/hooks/useTaskForm";
import type { FileInfo } from "@/lib/command-center/task-actions";
import { cn } from "@/lib/utils";
import type { TaskTableItem } from "@/types/task-table";

// Task drawer, form (Figma 60:11826; failed 60:11945): back + task title + close; "Submit required
// information" with the In progress pill and the draft state; the submission-failed alert; one
// TaskFormField per field. Footer: Save draft and Submit (Try again after a failure).
export interface TaskFormViewProps {
  task: TaskTableItem;
  /** Task version after /start. */
  version: number;
  /** Names/sizes of the draft's saved uploads. */
  initialFiles: FileInfo[];
  onSubmitted: (files: UploadedFile[]) => void;
  online: boolean;
  onBack: () => void;
  onClose: () => void;
}

const DRAFT_TEXT: Record<DraftState, string> = {
  idle: "",
  saving: "Saving draft…",
  saved: "Draft autosaved",
  error: "Draft not saved",
};

export function TaskFormView({
  task,
  version,
  initialFiles,
  onSubmitted,
  online,
  onBack,
  onClose,
}: TaskFormViewProps) {
  const form = useTaskForm(task, version, initialFiles, onSubmitted);
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 pt-5 pb-6">
        <div className="flex items-center gap-2">
          <DrawerIconButton icon="back-18" label="Back to task details" onClick={onBack} />
          <span className="min-w-0 flex-1 truncate type-ui-14 font-medium text-grey-700">
            {task.title}
          </span>
          <DrawerIconButton icon="close-18" label="Close" onClick={onClose} />
        </div>

        <div className="flex flex-col gap-2.5">
          <SheetTitle className="type-ui-22 font-semibold text-slate-900">
            Submit required information
          </SheetTitle>
          <div className="flex items-center gap-2.5">
            <StatePill tone="info">In progress</StatePill>
            <span
              className={cn(
                "type-ui-13 font-medium",
                form.draft === "error" ? "text-danger-700" : "text-slate-500",
              )}
            >
              {form.draft === "idle" && task.draftDay
                ? `Restored from draft · ${task.draftDay}`
                : DRAFT_TEXT[form.draft]}
            </span>
          </div>
        </div>

        {form.failed && (
          <AlertBanner
            title="Submission failed"
            message="We couldn’t send your submission. Your entries are saved — check your connection and try again."
          />
        )}

        {task.fields.map((field) => (
          <TaskFormField
            key={field.key}
            field={field}
            value={form.answers[field.key]}
            file={form.files[field.key]}
            online={online}
            onChange={(value) => form.setAnswer(field.key, value)}
            onFile={(f) => form.upload(field.key, f)}
            onRemoveFile={() => form.remove(field.key)}
            error={form.errors[field.key]}
          />
        ))}
      </div>

      <DrawerFooter>
        <Button
          variant="outline"
          size="pill"
          className="h-11 px-4.5"
          disabled={!online || form.draft === "saving"}
          onClick={form.saveNow}
        >
          Save draft
        </Button>
        <Button
          variant="green"
          size="pill"
          className="h-10.5 flex-1 px-4.5"
          disabled={!online || !form.canSubmit}
          onClick={form.submit}
        >
          {form.submitting ? "Submitting…" : form.failed ? "Try again" : "Submit"}
        </Button>
      </DrawerFooter>
    </>
  );
}
