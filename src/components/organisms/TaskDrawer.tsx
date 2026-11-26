"use client";

import { Sheet, SheetContent } from "@/components/ui";
import type { TaskTableItem } from "@/types/task-table";

import { TaskDrawerFlow, type TaskDrawerFlowProps } from "./TaskDrawerFlow";

// My tasks drawer (Figma "Task drawer" 60:11766): 460px, 10px from the top/right/bottom edges,
// 24px radius, task-drawer shadow, over a slate-900/24 scrim. The content is TaskDrawerFlow.
export interface TaskDrawerProps extends Omit<TaskDrawerFlowProps, "task"> {
  task: TaskTableItem | null;
}

export function TaskDrawer({ task, onClose, ...flow }: TaskDrawerProps) {
  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/24 supports-backdrop-filter:backdrop-blur-none"
        className="gap-0 rounded-[24px] border-0 bg-white p-0 shadow-task-drawer outline-none data-[side=right]:inset-y-2.5 data-[side=right]:right-2.5 data-[side=right]:h-auto data-[side=right]:w-115 data-[side=right]:max-w-[calc(100%-1.25rem)] data-[side=right]:border-l-0 data-[side=right]:sm:max-w-115"
      >
        {task && <TaskDrawerFlow key={task.id} task={task} onClose={onClose} {...flow} />}
      </SheetContent>
    </Sheet>
  );
}
