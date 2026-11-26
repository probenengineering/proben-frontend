"use client";

import { useRef, useState } from "react";

import {
  type FileInfo,
  saveDraftAction,
  submitTaskAction,
} from "@/lib/command-center/task-actions";
import { isFilled, missingMessage } from "@/lib/task-form";
import { showToast } from "@/lib/toast";
import type { TaskAnswers, TaskTableItem } from "@/types/task-table";

// The task form (Figma 60:11826 / 60:11945): answers keyed by field, uploads for file fields,
// draft autosave 1.5s after the last change (PATCH /tasks/{id}/draft), "Save draft" now, and
// submit (save, then POST /tasks/{id}/submit). Saves run one after another so each sends the
// version the previous one returned.

const AUTOSAVE_MS = 1500;
const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png"];

export type DraftState = "idle" | "saving" | "saved" | "error";

export interface UploadedFile extends FileInfo {
  uploading?: boolean;
}

type Files = Record<string, UploadedFile>;

/** Saved uploads per file field, named from `initialFiles` where known. */
function filesFrom(task: TaskTableItem, initialFiles: FileInfo[]): Files {
  return Object.fromEntries(
    task.fields
      .filter((f) => f.type === "file" && typeof task.answers[f.key] === "string")
      .map((f) => {
        const id = task.answers[f.key] as string;
        return [f.key, initialFiles.find((i) => i.id === id) ?? { id, name: "Attachment" }];
      }),
  );
}

export function useTaskForm(
  task: TaskTableItem,
  version: number,
  initialFiles: FileInfo[],
  onSubmitted: (files: UploadedFile[]) => void,
) {
  const [answers, setAnswers] = useState<TaskAnswers>(task.answers);
  const [files, setFiles] = useState<Files>(() => filesFrom(task, initialFiles));
  const [draft, setDraft] = useState<DraftState>("idle");
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // After a Submit with required fields empty, those fields show their errors (60:12401).
  const [attempted, setAttempted] = useState(false);

  // The latest answers/files for saves that run after a debounce; updated in the handlers.
  const latest = useRef<{ answers: TaskAnswers; files: Files } | null>(null);
  const versionRef = useRef(version);
  const queue = useRef<Promise<boolean>>(Promise.resolve(true));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = () =>
    (latest.current ??= { answers: task.answers, files: filesFrom(task, initialFiles) });

  const save = () => {
    if (timer.current) clearTimeout(timer.current);
    queue.current = queue.current.then(async () => {
      const { answers: a, files: f } = current();
      setDraft("saving");
      const ids = Object.values(f).flatMap((x) => (x.uploading || !x.id ? [] : [x.id]));
      const result = await saveDraftAction(task.id, versionRef.current, a, ids);
      if (!result.ok) {
        setDraft("error");
        return false;
      }
      versionRef.current = result.version;
      setDraft("saved");
      return true;
    });
    return queue.current;
  };

  const schedule = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, AUTOSAVE_MS);
  };

  const setAnswer = (key: string, value: TaskAnswers[string]) => {
    const now = current();
    now.answers = { ...now.answers, [key]: value };
    setAnswers(now.answers);
    schedule();
  };

  const setFile = (key: string, file: UploadedFile | null) => {
    const now = current();
    const rest = Object.fromEntries(Object.entries(now.files).filter(([k]) => k !== key));
    now.files = file ? { ...rest, [key]: file } : rest;
    setFiles(now.files);
  };

  const upload = async (key: string, file: File) => {
    if (!TYPES.includes(file.type)) return showToast("error", "Upload a PDF, JPG or PNG file.");
    if (file.size > MAX_BYTES) return showToast("error", "Files can be up to 10 MB.");
    setFile(key, { id: "", name: file.name, size: file.size, uploading: true });
    const body = new FormData();
    body.set("file", file);
    body.set("clientUploadId", crypto.randomUUID());
    const res = await fetch("/api/files", { method: "POST", body }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !data.id) {
      setFile(key, null);
      return showToast("error", data.message ?? "We couldn't upload this file. Try again.");
    }
    setFile(key, { id: String(data.id), name: file.name, size: file.size });
    setAnswer(key, String(data.id));
  };

  const remove = (key: string) => {
    setFile(key, null);
    setAnswer(key, null);
  };

  const missing = task.fields.filter((f) => f.required && !isFilled(f, answers[f.key]));
  const uploading = Object.values(files).some((f) => f.uploading);

  const submit = async () => {
    if (missing.length > 0) return setAttempted(true);
    setSubmitting(true);
    setFailed(false);
    const saved = await save();
    const result = saved ? await submitTaskAction(task.id, versionRef.current, true) : null;
    setSubmitting(false);
    if (!result?.ok) return setFailed(true);
    versionRef.current = result.version;
    onSubmitted(Object.values(current().files));
  };

  return {
    answers,
    files,
    setAnswer,
    upload,
    remove,
    saveNow: () => void save(),
    submit,
    draft,
    failed,
    submitting,
    canSubmit: !uploading && !submitting,
    errors: attempted
      ? Object.fromEntries(missing.map((f) => [f.key, missingMessage(f)]))
      : ({} as Record<string, string>),
  };
}
