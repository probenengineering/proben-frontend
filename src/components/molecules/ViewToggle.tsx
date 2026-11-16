import type { ReactNode } from "react";

import { Chip, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// View switch: outline chips (18px icons). Defaults to My Tasks' "Calender" / "List", which link
// to their routes; My Homes passes HOME_VIEWS ("List" / "Section") with onChange, switching in place.
export interface ViewOption {
  id: string;
  label: string;
  icon: IconName;
  /** Route for the view; omit and pass onChange to switch on the same page. */
  href?: string;
}

export const TASK_VIEWS: ViewOption[] = [
  { id: "calendar", label: "Calender", icon: "calendar", href: "/tasks" },
  { id: "list", label: "List", icon: "task", href: "/tasks/list" },
];

export const HOME_VIEWS: ViewOption[] = [
  { id: "list", label: "List", icon: "task" },
  { id: "section", label: "Section", icon: "category" },
];

export interface ViewToggleProps {
  current: string;
  views?: ViewOption[];
  /** Optional static dropdown chip, e.g. "Due soon". */
  filterLabel?: string;
  /** A working filter control instead of the static chip (task list). */
  filter?: ReactNode;
  /** Full width with the filter pushed to the far right (list view, Figma 51:10883). */
  spread?: boolean;
  /** Called with the view id when a chip without an href is clicked. */
  onChange?: (id: string) => void;
}

export function ViewToggle({
  current,
  views = TASK_VIEWS,
  filterLabel,
  filter,
  spread,
  onChange,
}: ViewToggleProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", spread && "w-full justify-between")}>
      <div className="flex items-center gap-3">
        {views.map((view) => (
          <Chip
            key={view.id}
            href={view.href}
            icon={view.icon}
            variant="outline"
            selected={view.id === current}
            onClick={view.href ? undefined : () => onChange?.(view.id)}
          >
            {view.label}
          </Chip>
        ))}
      </div>
      {filter ?? (filterLabel && <Chip trailingIcon="chevron-down-18">{filterLabel}</Chip>)}
    </div>
  );
}
