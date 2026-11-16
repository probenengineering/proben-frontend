import Link from "next/link";

import { Icon, StatusPill, type StatusPillProps } from "@/components/atoms";

import { TASK_TABLE_COLUMNS } from "./TaskTableHeader";

// Task table row (Figma 51:10883): name · description (one line, "…") · due time · status pill
// · › link. 50px tall, white-200 divider. Below sm (agreed, no Figma frame): name with the
// description under it, then time and pill on one line, › on the right.
export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";

const statuses: Record<TaskStatus, { label: string; tone: StatusPillProps["tone"] }> = {
  pending: { label: "Pending", tone: "outline" },
  "in-progress": { label: "In progress", tone: "teal" },
  completed: { label: "Completed", tone: "mint" },
  overdue: { label: "Over due", tone: "danger" },
};

export interface TaskRowProps {
  name: string;
  description: string;
  /** "08 : 00 AM", or a date ("Nov 3, 2026") in the overdue group. */
  time: string;
  status: TaskStatus;
  href?: string;
}

export function TaskRow({ name, description, time, status, href = "#" }: TaskRowProps) {
  const pill = statuses[status];
  return (
    <li
      className={`flex items-center border-b border-white-200 bg-white last:border-b-0 sm:grid ${TASK_TABLE_COLUMNS}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-3 pr-2 pl-5 sm:contents">
        <span className="truncate type-title-md text-black sm:py-3 sm:pr-2 sm:pl-5">{name}</span>
        <span className="truncate type-title-sm text-black-50 sm:px-3 sm:py-3 sm:type-title-md sm:text-black">
          {description}
        </span>
        <div className="flex items-center gap-3 pt-1 sm:contents">
          <span className="type-title-md whitespace-nowrap text-black sm:px-10 sm:pt-3 sm:pb-3.5">
            {time}
          </span>
          <span className="flex sm:justify-center sm:px-10 sm:py-2">
            <StatusPill tone={pill.tone} size="sm">
              {pill.label}
            </StatusPill>
          </span>
        </div>
      </div>
      <Link
        href={href}
        aria-label={`Open ${name}`}
        className="flex shrink-0 items-center justify-center self-stretch px-5 py-2"
      >
        <Icon name="arrow-down" size={16} className="-rotate-90" />
      </Link>
    </li>
  );
}
