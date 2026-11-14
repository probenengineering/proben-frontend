import type { IconName } from "@/components/atoms";
import { ArrowLink, InfoLine, QuickActionItem, TaskItem } from "@/components/molecules";

// Right column (400px on desktop): local time and homes, Quick Access links, Needs Attention tasks.
export interface DashboardAsideProps {
  actions: { icon: IconName; label: string; href?: string }[];
  tasks: string[];
}

function Heading({ children }: { children: string }) {
  return <h2 className="px-2 type-title-md font-medium text-black-50">{children}</h2>;
}

export function DashboardAside({ actions, tasks }: DashboardAsideProps) {
  return (
    <aside className="flex w-full flex-col gap-10 px-5 py-6">
      <div className="flex flex-col gap-2">
        <InfoLine icon="clock" text="7:12 PM Local Time" />
        <InfoLine icon="building-4" text="Maryland Home, Landville Home" extra="+2 more" />
      </div>

      <div className="flex flex-col gap-6">
        <Heading>Quick Access</Heading>
        <div className="flex flex-col items-start gap-1">
          {actions.map((action) => (
            <QuickActionItem key={action.label} {...action} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Heading>Needs Attention</Heading>
        <div className="flex flex-col items-start gap-1">
          {tasks.map((task) => (
            <TaskItem key={task} label={task} />
          ))}
          <ArrowLink tone="black">View all tasks</ArrowLink>
        </div>
      </div>
    </aside>
  );
}
