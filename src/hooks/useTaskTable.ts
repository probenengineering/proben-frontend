"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitTaskAction } from "@/lib/command-center/task-actions";
import { showActionToast, showToast } from "@/lib/toast";

import { useOnlineStatus } from "./useOnlineStatus";
import type { TaskTableItem, TaskTableStatus } from "@/types/task-table";

// State for the My tasks table (Figma 60:11012 / 60:11149 / 60:11212 / 60:11280):
// - "All tasks" lists open tasks; completed ones sit behind "Show N completed tasks".
// - The Completed filter sorts by most recent unless a sort is picked, and shows the first 5 rows
//   with "Show N more".
// - "Mark as complete" submits the task, moves it to Completed and shows the "View" toast; the drawer turns
//   its actions off while the browser is offline (60:11620).
// - nextUp: the Upcoming task due soonest, for the "You're all caught up" state (60:11426).
export type StatusFilter = "all" | TaskTableStatus;
export type SourceFilter =
  "all" | "training_policies" | "hr" | "documents" | "organizational" | "announcements";
export type TaskSort = "due" | "recent";

const FIRST_PAGE = 5;

export function useTaskTable(tasks: TaskTableItem[]) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatusState] = useState<StatusFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [pickedSort, setSort] = useState<TaskSort | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [finished, setFinished] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  const online = useOnlineStatus();

  const setStatus = (next: StatusFilter) => {
    setStatusState(next);
    setExpanded(false);
  };

  // Tasks finished here show as completed straight away; the refresh brings the server's dates.
  const all = tasks.map((t): TaskTableItem => {
    const at = finished[t.id];
    if (!at || t.status === "completed") return t;
    return {
      ...t,
      status: "completed",
      completedAt: at,
      completedDate: t.dueDate,
      completedRelative: t.dueTone === "overdue" ? undefined : "On time",
      item: { ...t.item, status: "completed", canComplete: false },
    };
  });

  const q = query.trim().toLowerCase();
  const searched = all.filter(
    (t) =>
      (!q || `${t.title} ${t.subtitle ?? ""}`.toLowerCase().includes(q)) &&
      (source === "all" || t.source === source),
  );
  // Needs attention includes overdue tasks (60:12610). "All tasks" lists open tasks (completed
  // sit behind "Show N completed tasks") but its count includes completed ones (60:12736).
  const inStatus = (t: TaskTableItem, s: StatusFilter) =>
    s === "all"
      ? t.status !== "completed"
      : s === "needs_attention"
        ? t.status === "needs_attention" || t.status === "overdue"
        : t.status === s;
  const count = (s: StatusFilter) =>
    s === "all" ? searched.length : searched.filter((t) => inStatus(t, s)).length;

  const completedView = status === "completed";
  const sort = pickedSort ?? (completedView ? "recent" : "due");
  const recentKey = (t: TaskTableItem) => (completedView ? t.completedAt : t.createdAt);
  const matching = searched
    .filter((t) => inStatus(t, status))
    .sort((a, b) => (sort === "due" ? a.dueAt - b.dueAt : recentKey(b) - recentKey(a)));
  const rows = completedView && !expanded ? matching.slice(0, FIRST_PAGE) : matching;

  const complete = (task: TaskTableItem) => {
    const version = task.version;
    if (version === undefined) return;
    startTransition(async () => {
      const result = await submitTaskAction(task.id, version, task.started);
      if (!result.ok) {
        showToast("error", result.error);
        return;
      }
      setFinished((f) => ({ ...f, [task.id]: Date.now() }));
      setOpenId(null);
      showActionToast(`${task.title} moved to Finished`, "View", () => setStatus("completed"));
      router.refresh();
    });
  };

  /** Submitted from the drawer's form: shows as completed now; the refresh brings server dates. */
  const markFinished = (task: TaskTableItem) => {
    setFinished((f) => ({ ...f, [task.id]: Date.now() }));
    router.refresh();
  };

  return {
    query,
    setQuery,
    status,
    setStatus,
    source,
    setSource,
    sort,
    setSort,
    count,
    rows,
    hiddenCount: matching.length - rows.length,
    showMore: () => setExpanded(true),
    total: all.length,
    open: all.find((t) => t.id === openId) ?? null,
    openId,
    markFinished,
    nextUp: all
      .filter((t) => t.status === "upcoming" && t.dueDate)
      .sort((a, b) => a.dueAt - b.dueAt)[0],
    online,
    retry: () => router.refresh(),
    setOpenId,
    complete,
    pending,
  };
}
