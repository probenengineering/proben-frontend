import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// A row in the profile panel: icon (plain, or in a 40px rounded box), title, optional subtitle,
// and something on the right (arrow, download, copy, toggle).
export interface ProfileRowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  /** Put the icon in a 40px box with a divider border and 12px radius. */
  boxed?: boolean;
  className?: string;
}

export function ProfileRow({ icon, title, subtitle, trailing, boxed, className }: ProfileRowProps) {
  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {boxed ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-divider">
            <Icon name={icon} />
          </span>
        ) : (
          <Icon name={icon} />
        )}
        <div className="flex min-w-0 flex-1 flex-col type-paragraph-sm">
          <p className="font-medium text-grey-900">{title}</p>
          {subtitle && <p className="truncate text-grey-700">{subtitle}</p>}
        </div>
      </div>
      {trailing}
    </div>
  );
}
