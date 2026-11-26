"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FilterSelect, ShiftRow, WeekStrip } from "@/components/molecules";
import { pickupShiftAction } from "@/lib/command-center/home-actions";
import { showActionToast, showToast } from "@/lib/toast";
import type { HomeShift } from "@/types/home";

// Home schedule tab (Figma 60:14124): "Week of 21 – 27 Oct" (Semi Bold 15/22) with "Show: All
// shifts" and "Open in calendar"; the week strip in a 14px-radius card (the selected day
// highlighted, dots on days with shifts); then the selected day's shifts under a slate-50 header
// ("Thursday, 25 Oct · 4 shifts"). Pick up shift: POST /shifts/{id}/pickup.
export interface HomeScheduleTabProps {
  homeId: string;
  week: string[];
  day: string;
  shifts: HomeShift[];
}

type Show = "all" | "mine" | "open";

const utc = (key: string) => new Date(`${key}T00:00:00Z`);
const fmt = (key: string, o: Intl.DateTimeFormatOptions) =>
  utc(key).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });

export function HomeScheduleTab({ homeId, week, day, shifts }: HomeScheduleTabProps) {
  const router = useRouter();
  const [show, setShow] = useState<Show>("all");
  const [pending, startTransition] = useTransition();
  const isOpen = (s: HomeShift) => s.needed !== undefined && s.filled < s.needed;
  const dayShifts = shifts.filter(
    (s) => s.day === day && (show === "all" || (show === "mine" ? s.mine : isOpen(s))),
  );
  const first = week[0];
  const last = week[6];
  const range = `${Number(first.slice(8))} – ${Number(last.slice(8))} ${fmt(last, { month: "short" })}`;
  const href = (key: string) => `/homes/${encodeURIComponent(homeId)}?tab=schedule&day=${key}`;

  const pickUp = (s: HomeShift) =>
    startTransition(async () => {
      const result = await pickupShiftAction(s.id);
      if (!result.ok) return void showToast("error", result.error);
      showActionToast(`You picked up the ${s.time} shift`);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="type-ui-15 font-semibold text-slate-900">Week of {range}</h2>
        <span className="flex-1" />
        <FilterSelect
          label="Show shifts"
          variant="status"
          showDot={false}
          fieldLabel="Show"
          value={show}
          onChange={setShow}
          options={[
            { id: "all", label: "All shifts" },
            { id: "mine", label: "My shifts" },
            { id: "open", label: "Open shifts" },
          ]}
        />
        <Link
          href={`/schedule?view=day&date=${day}`}
          className="flex h-8.5 items-center rounded-full border border-grey-300 bg-white px-3 type-ui-13-20 font-semibold text-grey-700 hover:bg-slate-50"
        >
          Open in calendar
        </Link>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-2.5">
        <WeekStrip
          hrefFor={href}
          days={week.map((key) => ({
            key,
            weekday: fmt(key, { weekday: "short" }).toUpperCase(),
            day: String(Number(key.slice(8))),
            today: key === day,
            hasItems: shifts.some((s) => s.day === key),
          }))}
        />
      </div>

      <div className="overflow-clip rounded-[14px] border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="type-ui-14 font-semibold text-slate-900">
            {fmt(day, { weekday: "long" })}, {fmt(day, { day: "numeric", month: "short" })} ·{" "}
            {dayShifts.length} {dayShifts.length === 1 ? "shift" : "shifts"}
          </h3>
        </div>
        {dayShifts.length === 0 ? (
          <p className="px-4 py-10 text-center type-ui-14 text-slate-500">No shifts on this day.</p>
        ) : (
          <ul>
            {dayShifts.map((s) => (
              <ShiftRow key={s.id} shift={s} pending={pending} onPickUp={() => pickUp(s)} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
