"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { EASE_OUT } from "@/components/atoms";
import { EmptyPanel, TaskStatusFilter, ViewToggle } from "@/components/molecules";
import { groupTasks, type TaskFilter, type TaskRecord } from "@/lib/tasks";

import { TaskGroup } from "./TaskGroup";

// My Tasks list view (Figma 51:10883 / 51:11193 / 51:11043): the Calender/List toggle with the
// "Due soon" status filter on the right, then the tasks grouped by day. Nothing ticked = due
// today or tomorrow; ticking "Over due" adds an "Over due" group with a Due date column.
export interface TaskListBoardProps {
  tasks: TaskRecord[];
  /** "2026-10-28": the day treated as Today. */
  today: string;
  /** The tasks failed to load; shown in place of "No tasks". */
  error?: string;
}

export function TaskListBoard({ tasks, today, error }: TaskListBoardProps) {
  const [filters, setFilters] = useState<TaskFilter[]>([]);
  const groups = groupTasks(tasks, filters, today);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full px-5">
        <ViewToggle
          current="list"
          spread
          filter={<TaskStatusFilter selected={filters} onChange={setFilters} />}
        />
      </div>
      {/* Re-keyed on each filter change so the new groups fade in. */}
      <motion.div
        key={filters.join(",")}
        className="flex w-full flex-col"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
      >
        {groups.length === 0 ? (
          <div className="px-6 pt-6">
            <EmptyPanel message={error ?? "No tasks"} />
          </div>
        ) : (
          groups.map((group) => <TaskGroup key={group.title} {...group} />)
        )}
      </motion.div>
    </div>
  );
}
