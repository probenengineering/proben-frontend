"use client";

import { Button, Icon, InitialsAvatar, PriorityLabel, StatePill } from "@/components/atoms";
import { ProgressTimeline, StaffSummaryRow, TASK_STATE_TONES } from "@/components/molecules";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui";
import { SheetDescription } from "@/components/ui/sheet";
import { STAFF_TINT_CLASSES } from "@/lib/staff";
import {
  formatDateTime,
  formatDay,
  isEditableTask,
  isOpenTask,
  type StaffTask,
  TASK_STATE_LABELS,
  taskState,
} from "@/lib/staff-tasks";

// Task detail drawer (Figma "Task detail drawer" 103:20282): 480px, 24px radius, 10px from the
// edges, side-drawer shadow, slate-900/40 scrim; full width on phones. Body (28 × 24, 20px gaps):
// status pill + priority with a 38px ✕; title Semi Bold 20/28 over the description (14/20
// slate-500); details box (slate-200 border, 12px radius, 16px sides, 120px labels); Instructions;
// Progress; Staff response (slate-50 box, 12px radius, 14 × 12, 13/18 slate-500 when empty); the
// read-only note (16px grey icon, 12/17 slate-500). Footer (slate-200 top border, 16 / 20
// padding, 10px gaps): Cancel task (plain, danger-600), Reassign (outline), Edit task (green).
// With task authority only: Cancel for unfinished tasks; Reassign and Edit (not designed yet) for
// tasks the backend still lets you edit. The reference link and review feedback have no Figma
// frame: a details row and a section like Instructions.
export interface StaffTaskDrawerProps {
  task: StaffTask | null;
  /** You can assign tasks (shows the footer actions). */
  manage?: boolean;
  onClose: () => void;
  onSoon: () => void;
  onCancel: (task: StaffTask) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="type-ui-14 font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function Body({
  task,
  manage,
  onClose,
  onSoon,
  onCancel,
}: { task: StaffTask } & Omit<StaffTaskDrawerProps, "task">) {
  const state = taskState(task);
  const first = task.assignee.name.split(" ")[0];
  const canCancel = manage && isOpenTask(task);
  const canEdit = manage && isEditableTask(task);
  const files = task.referenceFiles;
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 py-6">
        <div className="flex items-center gap-2">
          <StatePill tone={TASK_STATE_TONES[state]}>{TASK_STATE_LABELS[state]}</StatePill>
          <PriorityLabel priority={task.priority} />
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9.5 items-center justify-center rounded-full border border-grey-300 bg-white hover:bg-slate-50"
          >
            <Icon name="close-circle-20" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <SheetTitle className="type-ui-20 font-semibold text-slate-900">{task.title}</SheetTitle>
          <SheetDescription className="type-ui-14 text-slate-500">
            {task.description}
          </SheetDescription>
        </div>
        <dl className="flex flex-col rounded-[12px] border border-slate-200 px-4">
          <StaffSummaryRow label="Assigned to" narrow roomy divider>
            <span className="flex items-center gap-2">
              <InitialsAvatar
                name={task.assignee.name}
                size={32}
                tintClassName={STAFF_TINT_CLASSES[task.assignee.tint]}
                photoSrc={task.assignee.photoSrc}
              />
              {task.assignee.name}
            </span>
          </StaffSummaryRow>
          <StaffSummaryRow label="Assigned by" narrow roomy divider>
            {task.assignedBy}
          </StaffSummaryRow>
          <StaffSummaryRow label="Assigned on" narrow roomy divider>
            {formatDay(task.assignedOn)}
          </StaffSummaryRow>
          <StaffSummaryRow label="Due" narrow roomy divider>
            {formatDateTime(task.due)}
          </StaffSummaryRow>
          <StaffSummaryRow
            label="Related home"
            narrow
            roomy
            divider={!!task.referenceUrl || files.length > 0}
          >
            {task.home ?? <span className="text-grey-400">No home</span>}
          </StaffSummaryRow>
          {(task.referenceUrl || files.length > 0) && (
            <StaffSummaryRow label="Reference" narrow roomy>
              <span className="flex flex-col gap-0.5">
                {task.referenceUrl && (
                  <a
                    href={task.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-green-ink hover:underline"
                  >
                    {task.referenceUrl}
                  </a>
                )}
                {/* Each attached file opens in a new tab (PDFs and images preview inline). */}
                {files.map((id, i) => (
                  <a
                    key={id}
                    href={`/api/files/${encodeURIComponent(id)}?inline=1&name=reference-${i + 1}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-normal text-green-ink hover:underline"
                  >
                    {files.length === 1 ? "Attached file" : `Attached file ${i + 1}`}
                    <span aria-hidden>↗</span>
                  </a>
                ))}
              </span>
            </StaffSummaryRow>
          )}
        </dl>
        {task.instructions.length > 0 && (
          <Section title="Instructions">
            {task.instructions.map((line, i) => (
              <p key={i} className="type-ui-14 text-grey-700">
                {line}
              </p>
            ))}
          </Section>
        )}
        <section className="flex flex-col gap-2.5">
          <h3 className="type-ui-14 font-semibold text-slate-900">Progress</h3>
          <ProgressTimeline
            steps={[
              { label: "Assigned", when: formatDateTime(task.assignedOn) },
              {
                label: `Started by ${first}`,
                when: task.startedOn && formatDateTime(task.startedOn),
              },
              { label: "Submitted", when: task.submittedOn && formatDateTime(task.submittedOn) },
            ]}
          />
        </section>
        <Section title="Staff response">
          <p
            className={`rounded-[12px] bg-slate-50 px-3.5 py-3 type-ui-13 whitespace-pre-line ${task.response ? "text-grey-700" : "text-slate-500"}`}
          >
            {task.response ?? "No response submitted yet."}
          </p>
        </Section>
        {task.feedback && (
          <Section title="Review feedback">
            <p className="type-ui-14 whitespace-pre-line text-grey-700">{task.feedback}</p>
          </Section>
        )}
        <p className="flex items-center gap-2 type-ui-12-17 text-slate-500">
          <Icon name="info-grey-16" size={16} />
          You can track progress but can’t edit the staff member’s response.
        </p>
      </div>
      {(canCancel || canEdit) && (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-200 bg-white px-7 pt-4 pb-5">
          {canCancel && (
            <Button
              variant="ghost"
              size="pill-lg"
              className="text-danger-600"
              onClick={() => onCancel(task)}
            >
              Cancel task
            </Button>
          )}
          <span className="flex-1" />
          {canEdit && (
            <>
              <Button variant="outline" size="pill-lg" onClick={onSoon}>
                Reassign
              </Button>
              <Button variant="green" size="pill-lg" onClick={onSoon}>
                <Icon name="edit-white-18" size={18} />
                Edit task
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export function StaffTaskDrawer({ task, ...props }: StaffTaskDrawerProps) {
  return (
    <Sheet open={!!task} onOpenChange={(next) => !next && props.onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="gap-0 rounded-[24px] border-0 bg-white p-0 shadow-side-drawer outline-none data-[side=right]:inset-y-2.5 data-[side=right]:right-2.5 data-[side=right]:h-auto data-[side=right]:w-120 data-[side=right]:max-w-[calc(100%-1.25rem)] data-[side=right]:border-l-0 data-[side=right]:sm:max-w-120"
      >
        {task && <Body key={task.id} task={task} {...props} />}
      </SheetContent>
    </Sheet>
  );
}
