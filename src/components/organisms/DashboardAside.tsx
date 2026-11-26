import type { ReactNode } from "react";

import type { IconName } from "@/components/atoms";
import { ArrowLink, InfoLine, QuickActionItem, TaskItem } from "@/components/molecules";
import { LocalTime } from "@/components/molecules/LocalTime";

// Right column (400px on desktop): local time and homes, Quick Access links, Needs Attention tasks.
export interface DashboardAsideProps {
  actions: { icon: IconName; label: string; href?: string }[];
  /** Assigned home names; the first two show, the rest as "+N more". */
  homes: string[];
  /** Titles of the tasks that need attention. */
  tasks: string[];
  /** v2: the Open Shifts section at the bottom (Figma 60:9879). */
  openShifts?: ReactNode;
}

const SHOWN_HOMES = 2;

function Heading({ children }: { children: string }) {
  return <h2 className="px-2 type-title-md font-medium text-black-50">{children}</h2>;
}

export function DashboardAside({ actions, homes, tasks, openShifts }: DashboardAsideProps) {
  const more = homes.length - SHOWN_HOMES;
  return (
    <aside className="flex w-full flex-col gap-8 px-5 py-6">
      <div className="flex flex-col gap-2">
        <InfoLine
          icon="clock"
          text={
            <>
              <LocalTime /> Local Time
            </>
          }
        />
        {homes.length > 0 && (
          <InfoLine
            icon="building-4"
            text={homes.slice(0, SHOWN_HOMES).join(", ")}
            extra={more > 0 ? `+${more} more` : undefined}
          />
        )}
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
          {tasks.length === 0 ? (
            <p className="px-2 type-paragraph-sm text-grey-500">Nothing needs your attention.</p>
          ) : (
            tasks.map((task, i) => <TaskItem key={`${task}-${i}`} label={task} />)
          )}
          <ArrowLink tone="black" href="/tasks/list">
            View all tasks
          </ArrowLink>
        </div>
      </div>

      {openShifts}
    </aside>
  );
}
