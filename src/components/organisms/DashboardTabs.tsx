import { Chip } from "@/components/atoms";

// Row of filter chips under the header. Tabs with an href are links (Overview → /, My Tasks →
// /tasks). Scrolls sideways on small screens.
export interface DashboardTab {
  label: string;
  href?: string;
}

export interface DashboardTabsProps {
  tabs: DashboardTab[];
  selected?: string;
}

export function DashboardTabs({ tabs, selected = tabs[0]?.label }: DashboardTabsProps) {
  return (
    <div className="flex w-full shrink-0 [scrollbar-width:none] items-center gap-2 overflow-x-auto px-5">
      {tabs.map((tab) => (
        <Chip key={tab.label} href={tab.href} selected={tab.label === selected} className="px-3">
          {tab.label}
        </Chip>
      ))}
    </div>
  );
}
