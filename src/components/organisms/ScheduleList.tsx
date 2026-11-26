"use client";

import { useState, useTransition } from "react";

import { Chip } from "@/components/atoms";
import {
  MonthNav,
  ScheduleEmpty,
  ScheduleGroupHeader,
  ScheduleRow,
  ScheduleTableHeader,
} from "@/components/molecules";
import { calendarHref } from "@/lib/calendar-view";
import { completeEventAction } from "@/lib/command-center/schedule-actions";
import { addDays } from "@/lib/command-center/time";
import { showToast } from "@/lib/toast";
import type { ScheduleItem, ScheduleList as ScheduleListData } from "@/types/schedule";

import { ScheduleDetailPanel } from "./ScheduleDetailPanel";

// Schedule list view (Figma 60:6752): month nav | status filter chips with counts | Week; then a
// 12px-radius table: column header, an "Overdue" group, then a group per day (today → Saturday).
// Clicking a row opens the detail panel (60:6829); ticking an event completes it.
type Filter = "all" | "upcoming" | "completed" | "overdue";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All tasks" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "overdue", label: "Overdue" },
];

const keyOf = (item: ScheduleItem) => `${item.kind}-${item.id}`;

const matches = (item: ScheduleItem, filter: Filter) =>
  filter === "all" ||
  (filter === "upcoming" && (item.status === "upcoming" || item.status === "in_progress")) ||
  item.status === filter;

export function ScheduleList({ monthLabel, overdue, days }: ScheduleListData) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const withLocal = (item: ScheduleItem): ScheduleItem =>
    completed.has(keyOf(item)) ? { ...item, status: "completed", canComplete: false } : item;
  const groups = [
    ...(overdue.length
      ? [{ key: "overdue", label: "Overdue", today: false, isOverdue: true, items: overdue }]
      : []),
    ...days.map((d) => ({ ...d, isOverdue: false })),
  ].map((g) => ({ ...g, items: g.items.map(withLocal) }));
  const all = groups.flatMap((g) => g.items);
  const count = (f: Filter) => all.filter((item) => matches(item, f)).length;
  const selected = all.find((item) => keyOf(item) === selectedKey) ?? null;

  const setDone = (key: string, done: boolean) =>
    setCompleted((prev) => {
      const next = new Set(prev);
      if (done) next.add(key);
      else next.delete(key);
      return next;
    });

  const complete = (item: ScheduleItem) => {
    if (!item.canComplete) return;
    setDone(keyOf(item), true);
    startTransition(async () => {
      const result = await completeEventAction(item.id);
      if (!result.ok) {
        setDone(keyOf(item), false);
        showToast("error", result.error);
      }
    });
  };

  return (
    <div className="flex w-full flex-col gap-4 px-5 pt-4">
      <div className="flex w-full flex-wrap items-center gap-4">
        <MonthNav label={monthLabel} />
        <span aria-hidden className="hidden h-5 w-px bg-slate-200 sm:block" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              variant="outline"
              selected={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label} · {count(f.id)}
            </Chip>
          ))}
        </div>
        <Chip trailingIcon="chevron-down-18" className="ml-auto text-grey-600">
          Week
        </Chip>
      </div>

      <ul className="flex w-full flex-col overflow-clip rounded-[12px] border border-slate-200 bg-white">
        <ScheduleTableHeader />
        {all.length === 0 && (
          <li>
            <ScheduleEmpty
              size="large"
              icon="calendar-check"
              title="No tasks this week"
              text="When tasks are assigned to you, they’ll appear here grouped by day."
              actions={[
                {
                  label: "Go to next week",
                  variant: "outline",
                  href: calendarHref("/schedule", "week", addDays(days[0]?.key ?? "", 7)),
                },
                { label: "Open calendar", variant: "green", href: "/schedule" },
              ]}
            />
          </li>
        )}
        {all.length > 0 &&
          groups.map((group) => {
            const items = group.items.filter((item) => matches(item, filter));
            if (group.isOverdue && items.length === 0) return null;
            return [
              <ScheduleGroupHeader
                key={`${group.key}-header`}
                label={group.label}
                count={items.length}
                today={group.today}
                overdue={group.isOverdue}
              />,
              ...items.map((item) => (
                <ScheduleRow
                  key={keyOf(item)}
                  item={item}
                  selected={keyOf(item) === selectedKey}
                  onSelect={() => setSelectedKey(keyOf(item))}
                  onComplete={() => complete(item)}
                />
              )),
              items.length === 0 && (
                <li
                  key={`${group.key}-empty`}
                  className="border-b border-slate-200 py-4 pl-13.75 type-ui-13 text-grey-400 last:border-b-0"
                >
                  Nothing scheduled for this day.
                </li>
              ),
            ];
          })}
      </ul>

      <ScheduleDetailPanel
        item={selected}
        onClose={() => setSelectedKey(null)}
        onComplete={complete}
        pending={pending}
      />
    </div>
  );
}
