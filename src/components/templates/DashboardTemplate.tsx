import type { ReactNode } from "react";

// Home dashboard layout inside the AppShell card: header on top; below it the main column
// (tabs + sections, 20px gaps) and the 400px aside side by side on lg+, stacked and scrolling
// together below lg. The Messages dock floats 18px from the bottom-right of the window.
export interface DashboardTemplateProps {
  header: ReactNode;
  tabs: ReactNode;
  children: ReactNode;
  aside: ReactNode;
  dock?: ReactNode;
}

export function DashboardTemplate({ header, tabs, children, aside, dock }: DashboardTemplateProps) {
  return (
    <>
      {header}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-20 lg:flex-row lg:overflow-hidden lg:pb-0">
        <div className="flex min-w-0 flex-col gap-5 py-5 lg:flex-1 lg:overflow-y-auto">
          {tabs}
          <div className="flex w-full flex-col">{children}</div>
        </div>
        <div className="w-full shrink-0 lg:w-100 lg:overflow-y-auto">{aside}</div>
      </div>
      {dock && <div className="fixed right-4.5 bottom-4.5 z-10">{dock}</div>}
    </>
  );
}
