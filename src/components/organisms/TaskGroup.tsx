import { StatusPill } from "@/components/atoms";
import { SectionHeader, TaskRow, type TaskRowProps, TaskTableHeader } from "@/components/molecules";

// One day of the task list (Figma 51:10883): "Today · Tue, Oct 28, 2026" with an "N available"
// pill on the right, then a 16px-radius white-400 table (column titles + task rows).
// Spacing as in Figma: 24px above the first day, 8px + 4px between days, 20px below.
export interface TaskGroupProps {
  title: string;
  /** Grey date after the title; omitted for "Over due". */
  date?: string;
  /** Third column title, "Due time" or "Due date". */
  timeLabel?: string;
  available: number;
  tasks: TaskRowProps[];
}

export function TaskGroup({ title, date, available, timeLabel, tasks }: TaskGroupProps) {
  return (
    <section className="flex w-full flex-col gap-5 px-6 pt-6 pb-5 not-first:mt-2 not-first:pt-1">
      <SectionHeader
        icon="calendar-2"
        title={title}
        subtitle={date}
        size="md"
        trailing={
          <StatusPill tone="orange" size="sm" dot>
            {available} available
          </StatusPill>
        }
      />
      <div className="w-full overflow-clip rounded-[16px] border border-white-400">
        <TaskTableHeader timeLabel={timeLabel} />
        <ul className="flex w-full flex-col">
          {tasks.map((task, i) => (
            <TaskRow key={`${task.name}-${i}`} {...task} />
          ))}
        </ul>
      </div>
    </section>
  );
}
