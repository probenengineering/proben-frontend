import type { ReactNode } from "react";

import { Appear } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Page layout on the flat shell (My Homes 51:12496, Notifications 51:11625): header, then a
// scrolling column with the optional tabs, the heading row (title left, view toggle right) and the content, 24px apart; 40px side
// padding (20px while the profile panel is open). The panel sits on the right at lg+; below lg
// it replaces the column, like the chat profile.
export interface FlatPageTemplateProps {
  header: ReactNode;
  tabs?: ReactNode;
  heading?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  panel?: ReactNode;
}

export function FlatPageTemplate({
  header,
  tabs,
  heading,
  actions,
  children,
  panel,
}: FlatPageTemplateProps) {
  return (
    <>
      {header}
      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-6",
            panel ? "hidden lg:flex" : "flex lg:px-10",
          )}
        >
          {tabs}
          {(heading || actions) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {heading}
              {actions}
            </div>
          )}
          <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
        </div>
        {panel && (
          <Appear from="right" className="flex w-full lg:w-auto">
            {panel}
          </Appear>
        )}
      </div>
    </>
  );
}
