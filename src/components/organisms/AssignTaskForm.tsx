"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms";
import { Breadcrumb, NoticeBanner, StickyActionBar } from "@/components/molecules";
import { type AssignTaskSetup, useAssignTaskForm } from "@/hooks/useAssignTaskForm";
import { showActionToast, showToast } from "@/lib/toast";

import {
  TaskAssignmentSection,
  TaskDetailsSection,
  TaskSupportSection,
} from "./AssignTaskSections";

// Assign task (Figma 103:20399): breadcrumb, the error banner after a failed Assign (no Figma
// frame; same as Add staff), the three sections (20px padding, 16px gaps), and the action bar
// ("Daniel will get an in-app notification.", Cancel, Assign task). Assign uploads any reference
// files, creates the task (POST /admin/tasks) and returns to Staff tasks with the new task on top,
// highlighted, and "Task assigned to Daniel Mensah. View" (103:20339). There's no Save draft: the
// backend keeps no assignment drafts.
export type AssignTaskFormProps = AssignTaskSetup;

export function AssignTaskForm(props: AssignTaskFormProps) {
  const router = useRouter();
  const form = useAssignTaskForm(props);
  const n = form.errors.size;
  const first = form.staff?.name.split(" ")[0];

  const assign = async () => {
    if (form.busy) return;
    const name = form.staff?.name;
    const { task, error } = await form.assign();
    if (error) return showToast("error", error);
    if (!task) return;
    showActionToast(`Task assigned to ${name}.`, "View", () =>
      router.push(`/staff/tasks?added=${task.id}&task=${task.id}`),
    );
    router.push(`/staff/tasks?added=${task.id}`);
  };

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        void assign();
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <Breadcrumb parent={{ label: "Staff tasks", href: "/staff/tasks" }} current="Assign task" />
        {n > 0 && (
          <NoticeBanner
            message={`Fix ${n} ${n === 1 ? "field" : "fields"} to assign this task. Your other entries are kept.`}
          />
        )}
        <TaskDetailsSection form={form} />
        <TaskAssignmentSection form={form} />
        <TaskSupportSection form={form} />
      </div>
      <StickyActionBar
        note={
          first
            ? `${first} will get an in-app notification.`
            : "They will get an in-app notification."
        }
      >
        <Button
          variant="ghost"
          size="pill-lg"
          render={<Link href="/staff/tasks" />}
          nativeButton={false}
        >
          Cancel
        </Button>
        <Button type="submit" variant="green" size="pill-lg" disabled={!!form.busy}>
          {form.busy === "uploading"
            ? "Uploading files…"
            : form.busy === "assigning"
              ? "Assigning…"
              : "Assign task"}
        </Button>
      </StickyActionBar>
    </form>
  );
}
