import { Chip, type IconName } from "@/components/atoms";

// "Calender" / "List" switch: two outline chips that link to each view.
// Icons: Figma's "vuesax/linear/calendar" and "vuesax/linear/task" come from a linked library the
// MCP can't export, so calendar-2 and sort stand in until the real SVGs are added.
const VIEWS: { id: "calendar" | "list"; label: string; icon: IconName; href: string }[] = [
  { id: "calendar", label: "Calender", icon: "calendar-2", href: "/tasks" },
  { id: "list", label: "List", icon: "sort", href: "/tasks/list" },
];

export interface ViewToggleProps {
  current: "calendar" | "list";
  /** Optional dropdown chip after the toggle, e.g. "Due soon" (static for now). */
  filterLabel?: string;
}

export function ViewToggle({ current, filterLabel }: ViewToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {VIEWS.map((view) => (
        <Chip
          key={view.id}
          href={view.href}
          icon={view.icon}
          variant="outline"
          selected={view.id === current}
        >
          {view.label}
        </Chip>
      ))}
      {filterLabel && <Chip trailingIcon="chevron-down-18">{filterLabel}</Chip>}
    </div>
  );
}
