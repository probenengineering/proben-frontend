"use client";

import {
  FileUploadField,
  FormSection,
  FormSelectField,
  FormTextAreaField,
  FormTextField,
  StaffPickerField,
} from "@/components/molecules";
import {
  assigneeLabel,
  type AssignTaskForm,
  DUE_TIMES,
  PRIORITIES,
} from "@/hooks/useAssignTaskForm";

// The three sections of Assign task (Figma 103:20424, 103:20438, 103:20452). Rows are 16px apart:
// one, two or three equal columns on desktop, one column on phones. Related home lists only the
// chosen person's homes (the backend refuses any other), so the home-mismatch warning (103:20446)
// isn't needed before Assign; a refusal shows on the field.
const ROW2 = "grid grid-cols-1 gap-4 sm:grid-cols-2";
const ROW3 = "grid grid-cols-1 gap-4 sm:grid-cols-3";

export function TaskDetailsSection({ form }: { form: AssignTaskForm }) {
  const { values: v, set, errors } = form;
  return (
    <FormSection title="Task details" description="What needs to be done, and by when.">
      <FormTextField
        label="Task title"
        required
        placeholder="e.g. Complete medication pass training"
        value={v.title}
        onChange={set("title")}
        error={errors.get("title")}
      />
      <div className={ROW2}>
        <FormTextAreaField
          label="Description"
          required
          placeholder="What should they do?"
          value={v.description}
          onChange={set("description")}
          error={errors.get("description")}
        />
        <FormTextAreaField
          label="Instructions"
          placeholder="Add steps or notes"
          value={v.instructions}
          onChange={set("instructions")}
          error={errors.get("instructions")}
        />
      </div>
      <div className={ROW3}>
        <FormSelectField
          label="Priority"
          placeholder="Select priority"
          options={PRIORITIES}
          value={v.priority}
          onChange={set("priority")}
          error={errors.get("priority")}
        />
        <FormTextField
          label="Due date"
          required
          type="date"
          value={v.dueDate}
          onChange={set("dueDate")}
          error={errors.get("dueDate")}
        />
        <FormSelectField
          label="Due time"
          placeholder="Select time"
          options={DUE_TIMES}
          value={v.dueTime}
          onChange={set("dueTime")}
        />
      </div>
    </FormSection>
  );
}

export function TaskAssignmentSection({ form }: { form: AssignTaskForm }) {
  const { values: v, set, errors, staff, homes } = form;
  return (
    <FormSection
      title="Assignment"
      description="One accountable owner per task. They get a notification when you assign it."
    >
      <div className={ROW2}>
        <StaffPickerField
          label="Assign to"
          required
          placeholder="Select staff member"
          options={form.options.map((o) => ({ id: o.id, label: assigneeLabel(o) }))}
          value={staff && { id: staff.id, label: assigneeLabel(staff) }}
          onChange={form.pickStaff}
          query={form.query}
          onQueryChange={form.search}
          searching={form.searching}
          error={errors.get("assignee")}
        />
        <FormSelectField
          label="Related home"
          required={form.homeRequired}
          placeholder={
            !staff ? "Select staff member first" : homes.length ? "Select home" : "No homes"
          }
          options={homes.map((h) => h.label)}
          value={v.home}
          onChange={set("home")}
          disabled={!staff || homes.length === 0}
          error={errors.get("home")}
        />
      </div>
    </FormSection>
  );
}

export function TaskSupportSection({ form }: { form: AssignTaskForm }) {
  const { values: v, set, errors } = form;
  return (
    <FormSection
      title="Supporting information"
      description="Anything that helps them finish. Optional."
    >
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
        <FileUploadField files={v.files} onChange={set("files")} />
        <FormTextField
          label="Reference link"
          type="url"
          placeholder="https://"
          value={v.link}
          onChange={set("link")}
          error={errors.get("link")}
        />
      </div>
    </FormSection>
  );
}
