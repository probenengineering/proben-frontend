import { PriorityLabel, StatePill } from "@/components/atoms";
import type { ProfileTask } from "@/lib/staff-profile";

// A task on the staff profile (Figma "Task / Log monthly fire drill" 103:18982): slate-200
// border, 12px radius, 14 × 12 padding, 12px gaps. Title Inter Semi Bold 14/20 slate-900 over
// "home · due" (12/17 slate-500), then the priority and the status pill (tone by status, as on
// Staff tasks: overdue danger, in progress info, needs attention warning, completed success).
export interface ProfileTaskRowProps {
  task: ProfileTask;
}

export function ProfileTaskRow({ task }: ProfileTaskRowProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3 rounded-[12px] border border-slate-200 px-3.5 py-3">
      {/* At least 14rem for the text: on phones the priority and status wrap below it. */}
      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
        <p className="truncate type-ui-14 font-semibold text-slate-900">{task.title}</p>
        <p className="truncate type-ui-12-17 whitespace-pre text-slate-500">
          {`${task.home}  ·  ${task.due}`}
        </p>
      </div>
      <PriorityLabel priority={task.priority} />
      <StatePill tone={task.tone}>{task.status}</StatePill>
    </div>
  );
}
