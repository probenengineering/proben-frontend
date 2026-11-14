import { StatusPill } from "@/components/atoms";
import { SectionHeader, TaskRow, type TaskRowProps } from "@/components/molecules";

// One day of the task list: "Today · Tue, Oct 28, 2026" with an "N available" pill on the right,
// then the tasks in a 16px-radius white-400 card.
export interface TaskGroupProps {
  title: string;
  date: string;
  available: number;
  tasks: TaskRowProps[];
}

export function TaskGroup({ title, date, available, tasks }: TaskGroupProps) {
  return (
    <section className="flex w-full flex-col gap-5 p-6">
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
      <ul className="flex w-full flex-col overflow-clip rounded-[16px] border border-white-400">
        {tasks.map((task, i) => (
          <TaskRow key={`${task.home}-${i}`} {...task} />
        ))}
      </ul>
    </section>
  );
}
