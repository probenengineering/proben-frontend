"use client";

import { useState } from "react";

import {
  FilterSelect,
  InlineStats,
  NoticeBanner,
  PillSearch,
  type StaffTaskAction,
} from "@/components/molecules";
import {
  STAFF_TASK_FILTERS,
  STAFF_TASK_SORTS,
  useStaffTaskFilters,
} from "@/hooks/useStaffTaskFilters";
import { cancelTaskAction } from "@/lib/staff-api/actions";
import type { StaffTaskListResult } from "@/lib/staff-api/task-actions";
import { toStaffTask } from "@/lib/staff-api/task-mappers";
import type { StaffTask } from "@/lib/staff-tasks";
import { showToast } from "@/lib/toast";

import { CancelTaskDialog } from "./CancelTaskDialog";
import { StaffTaskDrawer } from "./StaffTaskDrawer";
import { StaffTaskTable } from "./StaffTaskTable";

// Staff tasks body (Figma 103:20163; drawer 103:20222; after assigning 103:20339): stats, then
// search (260px) + Filters on the left and Sort on the right, then the table; 20px padding and
// gaps. Live from GET /admin/tasks. A task opens in the drawer (from its title, its ⋯ menu, or
// ?task=<id>). Cancel task asks first, then POST /admin/tasks/{id}/cancel; Edit and Reassign
// aren't designed yet.
export interface StaffTasksListProps {
  /** Page 1 from the server. */
  initial: StaffTaskListResult;
  /** You can assign tasks (Cancel, Edit, Reassign). */
  manage: boolean;
  /** Task to open on arrival (?task=<id>, e.g. the toast's View). */
  openTask?: StaffTask;
  /** The task just assigned (?added=<id>): on top, highlighted. */
  addedTask?: StaffTask;
}

const soon = () => showToast("error", "This isn’t available yet.");

export function StaffTasksList({ initial, manage, openTask, addedTask }: StaffTasksListProps) {
  const [pinned, setPinned] = useState(addedTask ?? null);
  const f = useStaffTaskFilters(initial, pinned);
  const [openId, setOpenId] = useState(openTask?.id ?? null);
  /** Tasks changed here (cancelled) or opened from a link, by id. */
  const [known, setKnown] = useState<Record<string, StaffTask>>({});
  const [confirming, setConfirming] = useState<StaffTask | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Follow ?task= and ?added= when they change (e.g. the toast's View), without an effect.
  const [lastLinks, setLastLinks] = useState({ openTask, addedTask });
  if (openTask !== lastLinks.openTask || addedTask !== lastLinks.addedTask) {
    setLastLinks({ openTask, addedTask });
    setOpenId(openTask?.id ?? null);
    setPinned(addedTask ?? null);
  }

  const find = (id: string | null) =>
    !id
      ? null
      : (known[id] ??
        f.rows.find((t) => t.id === id) ??
        (openTask?.id === id ? openTask : undefined) ??
        null);
  const remember = (task: StaffTask) => setKnown((all) => ({ ...all, [task.id]: task }));

  const onAction = (action: StaffTaskAction, task: StaffTask) => {
    if (action === "view") return setOpenId(task.id);
    if (action === "cancel") return setConfirming(task);
    soon();
  };

  const cancel = async () => {
    if (!confirming) return;
    setCancelling(true);
    const result = await cancelTaskAction(confirming.id, confirming.version);
    setCancelling(false);
    if (!result.ok) {
      showToast(
        "error",
        result.status === 409
          ? "This task changed or can’t be cancelled any more. The list has been refreshed."
          : result.error,
      );
      if (result.status === 409) f.refresh();
      return;
    }
    const updated = toStaffTask(result.data);
    remember(updated);
    if (pinned?.id === updated.id) setPinned(updated);
    setConfirming(null);
    showToast("success", "Task cancelled.");
    f.refresh();
  };

  const t = f.totals;
  return (
    <div className="flex flex-col gap-5 px-5">
      <InlineStats
        stats={[
          { icon: "stat-tasks-16", value: t.all, label: t.all === 1 ? "task" : "tasks" },
          { icon: "stat-upcoming-16", value: t.upcoming, label: "upcoming" },
          { icon: "stat-in-progress-16", value: t.in_progress, label: "in progress" },
          { icon: "stat-completed-16", value: t.completed, label: "completed" },
          { icon: "stat-overdue-16", value: t.overdue, label: "overdue" },
        ]}
      />
      <div className="flex flex-wrap items-center gap-2">
        <PillSearch
          value={f.query}
          onChange={f.setQuery}
          placeholder="Search task or staff"
          className="w-full sm:w-65"
        />
        <FilterSelect
          label="Filter tasks"
          variant="status"
          showDot={false}
          fieldLabel="Filters"
          value={f.filter}
          onChange={f.setFilter}
          options={STAFF_TASK_FILTERS}
        />
        <span className="flex-1" />
        <FilterSelect
          label="Sort tasks"
          variant="status"
          showDot={false}
          fieldLabel="Sort"
          value={f.sort}
          onChange={f.setSort}
          options={STAFF_TASK_SORTS}
        />
      </div>
      {f.error && <NoticeBanner message={f.error} />}
      <StaffTaskTable
        filters={{ ...f, rows: f.rows.map((row) => known[row.id] ?? row) }}
        highlighted={pinned?.id ?? null}
        manage={manage}
        onAction={onAction}
      />
      <StaffTaskDrawer
        task={find(openId)}
        manage={manage}
        onClose={() => setOpenId(null)}
        onSoon={soon}
        onCancel={setConfirming}
      />
      <CancelTaskDialog
        task={confirming}
        pending={cancelling}
        onOpenChange={(open) => !open && setConfirming(null)}
        onConfirm={() => void cancel()}
      />
    </div>
  );
}
