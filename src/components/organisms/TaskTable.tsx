"use client";

import {
  OfflineBanner,
  TableFooterButton,
  TaskColumnHeader,
  TaskTableEmpty,
  TaskTableHeading,
  TaskTableRow,
} from "@/components/molecules";
import { useTaskTable } from "@/hooks/useTaskTable";
import type { TaskTableData } from "@/types/task-table";

import { TaskDrawer } from "./TaskDrawer";
import { TaskTableToolbar } from "./TaskTableToolbar";

// My tasks (Figma 60:11012; filtered 60:11084 / 60:11149; completed 60:11212; no tasks 60:11358;
// caught up 60:11426; offline 60:11620): heading with search, the offline banner when the browser
// is offline, the toolbar, then a 12px-radius slate-200 table. Logic lives in useTaskTable. A row
// opens the task drawer (60:11701): details, the form (60:11826) and the submitted view (60:12071).
const CAUGHT_UP = {
  overdue: "Nothing is overdue right now.",
  needs_attention: "Nothing needs your attention right now.",
};

const savedTime = (at?: number) =>
  at ? new Date(at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : undefined;

export function TaskTable({ tasks, loadedAt }: TaskTableData) {
  const t = useTaskTable(tasks);
  const completedView = t.status === "completed";
  const completedCount = t.count("completed");
  const caughtUp = t.status === "overdue" || t.status === "needs_attention";

  const empty =
    t.total === 0 ? (
      <TaskTableEmpty />
    ) : caughtUp && t.rows.length === 0 ? (
      <TaskTableEmpty
        title="You’re all caught up"
        message={`${CAUGHT_UP[t.status as keyof typeof CAUGHT_UP]}${
          t.nextUp ? ` Next up: ${t.nextUp.title} on ${t.nextUp.dueDate?.split(",")[0]}.` : ""
        }`}
        actionLabel="View coming up"
        tone="green"
        onAction={() => t.setStatus("upcoming")}
      />
    ) : t.rows.length === 0 ? (
      <p className="px-4 py-10 text-center type-ui-14 text-slate-500">
        No tasks match these filters.
      </p>
    ) : null;

  return (
    <div className="flex w-full flex-col gap-5">
      <TaskTableHeading query={t.query} onQueryChange={t.setQuery} />

      <div className="flex w-full flex-col gap-5 px-5 pt-4">
        {!t.online && <OfflineBanner savedAt={savedTime(loadedAt)} onRetry={t.retry} />}
        <TaskTableToolbar
          status={t.status}
          onStatusChange={t.setStatus}
          count={t.count}
          source={t.source}
          onSourceChange={t.setSource}
          sort={t.sort}
          onSortChange={t.setSort}
        />

        <div className="overflow-clip rounded-[12px] border border-slate-200 bg-white">
          <TaskColumnHeader dateLabel={completedView ? "Completed" : "Due date"} />
          {empty ?? (
            <ul>
              {t.rows.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  selected={t.openId === task.id}
                  onOpen={() => t.setOpenId(task.id)}
                />
              ))}
            </ul>
          )}
          {completedView && t.hiddenCount > 0 && (
            <TableFooterButton label={`Show ${t.hiddenCount} more`} onClick={t.showMore} />
          )}
          {t.status === "all" && completedCount > 0 && (
            <TableFooterButton
              tone="muted"
              label={`Show ${completedCount} completed task${completedCount === 1 ? "" : "s"}`}
              onClick={() => t.setStatus("completed")}
            />
          )}
        </div>
      </div>

      <TaskDrawer
        task={t.open}
        online={t.online}
        pending={t.pending}
        onClose={() => t.setOpenId(null)}
        onComplete={() => t.open && t.complete(t.open)}
        onSubmitted={() => t.open && t.markFinished(t.open)}
        onViewFinished={() => {
          t.setOpenId(null);
          t.setStatus("completed");
        }}
      />
    </div>
  );
}
