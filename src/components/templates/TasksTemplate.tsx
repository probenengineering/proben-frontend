import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// My Tasks layout inside the AppShell card: header, tabs, then the heading row (title on the
// left, view toggle and filter on the right; wraps on small screens), then the scrolling content
// (week calendar or task list). 20px top padding; gaps are 20px in the list frame and 8px in
// the calendar frame (dense). The list view renders its own toolbar row (TaskListBoard).
export interface TasksTemplateProps {
  header: ReactNode;
  /** Omitted on detail pages, which show a breadcrumb instead (My homes 60:13792). */
  tabs?: ReactNode;
  /** Omit when the content draws its own heading row (My tasks table). */
  heading?: ReactNode;
  /** Right side of the heading row (calendar view). */
  actions?: ReactNode;
  children: ReactNode;
  dense?: boolean;
}

export function TasksTemplate({
  header,
  tabs,
  heading,
  actions,
  children,
  dense,
}: TasksTemplateProps) {
  return (
    <>
      {header}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto py-5",
          dense ? "gap-2" : "gap-5",
        )}
      >
        {tabs}
        {(heading || actions) && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5">
            {heading}
            {actions}
          </div>
        )}
        <div className="flex w-full flex-col">{children}</div>
      </div>
    </>
  );
}
