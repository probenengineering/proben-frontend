import Link from "next/link";

import { Checkbox, Icon, StatusPill } from "@/components/atoms";

// Task list row: 24px checkbox with home and role, a time with clock icon, a status pill and a
// › link. Desktop: four columns (the first three share the width). Below sm (agreed, not in
// Figma): time and pill sit under the home name.
export type TaskStatus = "pending" | "in-progress";

const statuses: Record<TaskStatus, { label: string; tone: "orange" | "teal" }> = {
  pending: { label: "Pending", tone: "orange" },
  "in-progress": { label: "In progress", tone: "teal" },
};

export interface TaskRowProps {
  home: string;
  role: string;
  time: string;
  status: TaskStatus;
  href?: string;
}

export function TaskRow({ home, role, time, status, href = "#" }: TaskRowProps) {
  const pill = statuses[status];
  return (
    <li className="flex w-full items-stretch border-b border-white-200 bg-white last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[32px] p-2">
          <Checkbox size="lg" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="type-title-md font-medium text-black">{home}</span>
            <span className="type-title-sm text-black-50">{role}</span>
          </span>
        </label>
        <div className="flex items-center gap-4 pb-3 pl-10.5 sm:contents">
          <div className="flex items-center justify-center gap-2.5 sm:flex-1 sm:px-5 sm:pt-3 sm:pb-3.5">
            <Icon name="clock" size={16} />
            <span className="type-title-sm whitespace-nowrap text-black">{time}</span>
          </div>
          <div className="flex items-center justify-center sm:flex-1 sm:px-5 sm:pt-3 sm:pb-3.5">
            <StatusPill tone={pill.tone} size="sm">
              {pill.label}
            </StatusPill>
          </div>
        </div>
      </div>
      <Link
        href={href}
        aria-label={`Open ${home}`}
        className="flex shrink-0 items-center justify-center px-5 pt-3 pb-3.5"
      >
        <Icon name="arrow-right-24" size={18} />
      </Link>
    </li>
  );
}
