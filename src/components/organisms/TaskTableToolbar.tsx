"use client";

import { Icon } from "@/components/atoms";
import { FilterSelect } from "@/components/molecules";
import type { SourceFilter, StatusFilter, TaskSort } from "@/hooks/useTaskTable";

// My tasks toolbar (Figma "List toolbar" 60:11054): Status dropdown (status-coloured dot, count)
// on the left; All sources and Sort on the right. While loading (60:11536) the Status pill is a
// static 50% slate-50 copy with "–" as its count.
const STATUSES: { id: StatusFilter; label: string; dot: string }[] = [
  { id: "all", label: "All tasks", dot: "bg-grey-400" },
  { id: "overdue", label: "Overdue", dot: "bg-danger-500" },
  { id: "needs_attention", label: "Needs attention", dot: "bg-caution-500" },
  { id: "in_progress", label: "In progress", dot: "bg-info-500" },
  { id: "upcoming", label: "Upcoming", dot: "bg-grey-400" },
  { id: "completed", label: "Completed", dot: "bg-verified-500" },
];
const SOURCES: { id: SourceFilter; label: string }[] = [
  { id: "all", label: "All sources" },
  { id: "training_policies", label: "Training & Policies" },
  { id: "hr", label: "HR" },
  { id: "documents", label: "My Documents" },
  { id: "organizational", label: "Organizational" },
  { id: "announcements", label: "Announcements" },
];
const SORTS: { id: TaskSort; label: string }[] = [
  { id: "due", label: "Due date" },
  { id: "recent", label: "Most recent" },
];

const noop = () => {};

export interface TaskTableToolbarProps {
  status?: StatusFilter;
  onStatusChange?: (status: StatusFilter) => void;
  count?: (status: StatusFilter) => number;
  source?: SourceFilter;
  onSourceChange?: (source: SourceFilter) => void;
  sort?: TaskSort;
  onSortChange?: (sort: TaskSort) => void;
  loading?: boolean;
}

export function TaskTableToolbar({
  status = "all",
  onStatusChange = noop,
  count,
  source = "all",
  onSourceChange = noop,
  sort = "due",
  onSortChange = noop,
  loading,
}: TaskTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {loading ? (
        <span
          aria-hidden
          className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-grey-300 bg-slate-50 pr-2.5 pl-3 type-ui-13 font-medium opacity-50"
        >
          <span className="size-2 rounded-full bg-grey-400" />
          <span className="text-slate-500">Status</span>
          <span className="font-semibold text-slate-900">All tasks</span>
          <span className="rounded-full bg-slate-100 px-1.75 py-px type-ui-12 text-grey-700">
            –
          </span>
          <Icon name="chevron-down" size={16} />
        </span>
      ) : (
        <FilterSelect
          label="Filter by status"
          variant="status"
          value={status}
          active={status !== "all"}
          dotClass={STATUSES.find((s) => s.id === status)?.dot}
          onChange={onStatusChange}
          heading="Filter by status"
          divideFirst
          options={STATUSES.map(({ id, label, dot }) => ({ id, label, dot, count: count?.(id) }))}
        />
      )}
      <span className="flex-1" />
      <FilterSelect
        label="Filter by source"
        value={source}
        onChange={onSourceChange}
        options={SOURCES}
      />
      <FilterSelect
        label="Sort"
        prefix="Sort:"
        value={sort}
        onChange={onSortChange}
        options={SORTS}
      />
    </div>
  );
}
