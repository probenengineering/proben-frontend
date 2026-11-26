"use client";

import { Checkbox, Icon, Input } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/hooks/useTaskForm";
import type { TaskAnswers, TaskField } from "@/types/task-table";

import { AttachmentItem, formatBytes } from "./AttachmentItem";
import { FileDropzone } from "./FileDropzone";

// One task form field (Figma 60:11907 / 60:11926 / 60:11935). Labels Inter Medium 14/20
// grey-700 with " *" when required. file: dropzone + the uploaded file (10px gaps); text/number:
// 42px input with a 10px radius (6px gap); boolean: 18px checkbox + Inter 14/20 grey-700 label.
// date and phone use the same input (native date picker / phone keyboard); no Figma frame yet.
export interface TaskFormFieldProps {
  field: TaskField;
  value: TaskAnswers[string] | undefined;
  file?: UploadedFile;
  online: boolean;
  onChange: (value: TaskAnswers[string]) => void;
  onFile: (file: File) => void;
  onRemoveFile: () => void;
  /** "Add an alternative phone number to submit." */
  error?: string;
}

const LABEL = "type-ui-14 font-medium text-grey-700";
const INPUT_TYPE = { number: "number", date: "date", phone: "tel" } as const;

/** minDate / maxDate may be "today" or "tomorrow" (task timezone) as well as "YYYY-MM-DD". */
function dateBound(value: string | undefined) {
  if (value !== "today" && value !== "tomorrow") return value;
  const day = new Date();
  if (value === "tomorrow") day.setDate(day.getDate() + 1);
  return day.toLocaleDateString("en-CA");
}

export function TaskFormField({
  field,
  value,
  file,
  online,
  onChange,
  onFile,
  onRemoveFile,
  error,
}: TaskFormFieldProps) {
  const errorText = error ? (
    <p className="type-ui-12 text-danger-700">{error}</p>
  ) : (
    field.hint && <p className="type-ui-12 text-grey-500">{field.hint}</p>
  );
  const label = `${field.label}${field.required ? " *" : ""}`;
  const id = `task-field-${field.key}`;

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2.5">
        <Checkbox
          size="form"
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <span className="type-ui-14 text-grey-700">{field.label}</span>
        {errorText}
      </label>
    );
  }

  if (field.type === "file") {
    return (
      <div className="flex flex-col gap-2.5">
        <span className={LABEL}>{label}</span>
        <FileDropzone onFile={onFile} disabled={!online} />
        {file && (
          <AttachmentItem
            name={file.name}
            variant={file.uploading ? "uploading" : "uploaded"}
            note={
              file.uploading
                ? "Uploading…"
                : [formatBytes(file.size), "Uploaded"].filter(Boolean).join(" · ")
            }
            onRemove={file.uploading ? undefined : onRemoveFile}
          />
        )}
        {errorText}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <Input
        id={id}
        type={field.type in INPUT_TYPE ? INPUT_TYPE[field.type as keyof typeof INPUT_TYPE] : "text"}
        inputMode={field.type === "phone" ? "tel" : undefined}
        autoComplete={field.type === "phone" ? "tel" : undefined}
        min={field.type === "date" ? dateBound(field.minDate) : undefined}
        max={field.type === "date" ? dateBound(field.maxDate) : undefined}
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) =>
          onChange(
            field.type === "number" && e.target.value !== ""
              ? Number(e.target.value)
              : e.target.value,
          )
        }
        aria-invalid={!!error}
        className="aria-invalid:border-0 aria-invalid:ring-0"
        iconRight={
          value !== undefined && value !== null && value !== "" ? (
            <Icon name="field-ok-16" size={16} />
          ) : undefined
        }
        frameClassName={cn(
          "h-10.5 gap-2 rounded-[10px] px-3.5 py-2.5 type-ui-14",
          error && "border-danger-300 focus-within:border-danger-300 hover:border-danger-300",
        )}
      />
      {errorText}
    </div>
  );
}
