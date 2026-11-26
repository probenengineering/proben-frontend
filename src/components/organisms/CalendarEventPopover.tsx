"use client";

import { Button, Icon, type IconName, StatePill, TypeTag } from "@/components/atoms";
import { STATUS_PILL } from "@/components/molecules";
import { formatDay } from "@/lib/command-center/time";
import type { ScheduleItem } from "@/types/schedule";

// "Event peek popover" (Figma 60:7847), shown beside a clicked calendar event: 300px, 16px radius,
// slate-200 border, popover shadow. Type tag + status, title (Inter Semi Bold 16/24), meta rows
// (16px icon + Inter 13/20 grey-700), then Mark complete / View details.
// Figma's "Assigned by" row needs data the API doesn't have yet (R26), so it's left out; the
// location row shows the home.
export interface CalendarEventPopoverProps {
  item: ScheduleItem;
  onComplete: () => void;
  onViewDetails: () => void;
}

function MetaRow({ icon, children }: { icon: IconName; children: string }) {
  return (
    <p className="flex items-center gap-2 type-ui-13-20 text-grey-700">
      <Icon name={icon} size={16} />
      <span className="truncate">{children}</span>
    </p>
  );
}

export function CalendarEventPopover({
  item,
  onComplete,
  onViewDetails,
}: CalendarEventPopoverProps) {
  const day = `${formatDay(item.day, { weekday: "short" })} ${Number(item.day.slice(8))} ${formatDay(item.day, { month: "short" })}`;
  const canComplete = item.canComplete && item.status !== "completed";
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <TypeTag label={item.type.label} tone={item.type.tone} />
        <StatePill tone={STATUS_PILL[item.status].tone}>{STATUS_PILL[item.status].label}</StatePill>
      </div>
      <p className="type-ui-16 font-semibold text-slate-900">{item.title}</p>
      <div className="flex flex-col gap-1.5">
        <MetaRow icon="meta-clock">{`${day} · ${item.time}`}</MetaRow>
        {item.home && <MetaRow icon="meta-location">{item.home}</MetaRow>}
      </div>
      <div className="flex gap-2">
        {canComplete && (
          <Button variant="outline" size="pill-compact" className="flex-1" onClick={onComplete}>
            Mark complete
          </Button>
        )}
        <Button variant="green" size="pill-compact" className="flex-1" onClick={onViewDetails}>
          View details
        </Button>
      </div>
    </div>
  );
}
