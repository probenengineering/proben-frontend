"use client";

import { useEffect, useState } from "react";

import type { UploadedFile } from "@/hooks/useTaskForm";
import { type FileInfo, getFilesAction, startTaskAction } from "@/lib/command-center/task-actions";
import { showToast } from "@/lib/toast";
import type { TaskTableItem } from "@/types/task-table";

import { TaskDetailView } from "./TaskDetailView";
import { TaskFormView } from "./TaskFormView";
import { TaskSubmittedView } from "./TaskSubmittedView";

// One task's journey in the drawer: details → (Start task) form → submitted. Start calls POST
// /tasks/{id}/start for an upcoming task first. The form stays mounted once opened so going back
// to the details keeps its entries. Render with key={task.id} so each task starts fresh.
export interface TaskDrawerFlowProps {
  task: TaskTableItem;
  online: boolean;
  pending: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSubmitted: () => void;
  onViewFinished: () => void;
}

const stamp = (at: number) =>
  `${new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

export function TaskDrawerFlow({
  task,
  online,
  pending,
  onClose,
  onComplete,
  onSubmitted,
  onViewFinished,
}: TaskDrawerFlowProps) {
  const [view, setView] = useState<"details" | "form" | "done">("details");
  const [formVersion, setFormVersion] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [done, setDone] = useState<{ at: number; file?: string } | null>(null);

  useEffect(() => {
    if (task.attachmentIds.length === 0) return;
    let live = true;
    getFilesAction(task.attachmentIds).then((info) => live && setFiles(info));
    return () => {
      live = false;
    };
  }, [task.attachmentIds]);

  const start = async () => {
    if (formVersion !== null) return setView("form");
    if (task.version === undefined) return;
    if (task.started) {
      setFormVersion(task.version);
      return setView("form");
    }
    setStarting(true);
    const result = await startTaskAction(task.id, task.version);
    setStarting(false);
    if (!result.ok) return showToast("error", result.error);
    setFormVersion(result.version);
    setView("form");
  };

  const retryFile = async (id: string) => {
    const [info] = await getFilesAction([id]);
    if (info) setFiles((list) => list.map((f) => (f.id === id ? info : f)));
  };

  const submitted = (uploaded: UploadedFile[]) => {
    setDone({ at: Date.now(), file: uploaded[0]?.name });
    setView("done");
    onSubmitted();
  };

  if (view === "done" && done) {
    return (
      <TaskSubmittedView
        task={task}
        submittedAt={stamp(done.at)}
        fileName={done.file}
        onClose={onClose}
        onViewFinished={onViewFinished}
      />
    );
  }
  return (
    <>
      {view === "details" && (
        <TaskDetailView
          task={task}
          files={files}
          online={online}
          pending={pending || starting}
          onClose={onClose}
          onStart={start}
          onComplete={onComplete}
          onRetryFile={retryFile}
        />
      )}
      {formVersion !== null && (
        <div className={view === "form" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <TaskFormView
            task={task}
            version={formVersion}
            initialFiles={files}
            onSubmitted={submitted}
            online={online}
            onBack={() => setView("details")}
            onClose={onClose}
          />
        </div>
      )}
    </>
  );
}
