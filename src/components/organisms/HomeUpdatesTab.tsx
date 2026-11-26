"use client";

import { useState, useTransition } from "react";

import { SideListCard, UpdateCard } from "@/components/molecules";
import { acknowledgeUpdateAction } from "@/lib/command-center/home-actions";
import { showActionToast, showToast } from "@/lib/toast";
import type { AssignedHome, HomeUpdateItem } from "@/types/home";

// Home updates tab (Figma 60:14244; acknowledged 60:14383): "1 update needs your acknowledgement"
// (Medium 13/18 caution-700) or "All updates acknowledged" (verified-700) on the right; the feed
// of update cards (12px gaps) beside a 320px column with Home contacts and This week. Acknowledge:
// POST /home-updates/{id}/acknowledge, then the card turns green and a toast confirms.
export interface HomeUpdatesTabProps {
  home: AssignedHome;
  updates: HomeUpdateItem[];
}

const stamp = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};

export function HomeUpdatesTab({ home, updates }: HomeUpdatesTabProps) {
  const [acked, setAcked] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const list = updates.map((u) => (acked[u.id] ? { ...u, acknowledged: acked[u.id] } : u));
  const waiting = list.filter((u) => u.requiresAck && !u.acknowledged).length;
  const thisWeek = list.filter((u) => u.thisWeek).length;

  const acknowledge = (u: HomeUpdateItem) => {
    setPendingId(u.id);
    startTransition(async () => {
      const result = await acknowledgeUpdateAction(u.id);
      setPendingId(null);
      if (!result.ok) return void showToast("error", result.error);
      setAcked((a) => ({ ...a, [u.id]: stamp(result.at) }));
      showActionToast("Update acknowledged · removed from My Tasks");
    });
  };

  const contacts = [
    ...(home.phone ? [{ label: "Home phone", value: home.phone }] : []),
    ...(home.email ? [{ label: "Email", value: home.email }] : []),
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {list.some((u) => u.requiresAck) && (
        <p
          className={`text-right type-ui-13 font-medium ${waiting ? "text-caution-700" : "text-verified-700"}`}
        >
          {waiting
            ? `${waiting} ${waiting === 1 ? "update needs" : "updates need"} your acknowledgement`
            : "All updates acknowledged"}
        </p>
      )}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {list.length === 0 ? (
          <p className="flex-1 rounded-[14px] border border-slate-200 bg-white px-4 py-10 text-center type-ui-14 text-slate-500">
            No updates for this home yet.
          </p>
        ) : (
          <ul className="flex min-w-0 flex-1 flex-col gap-3">
            {list.map((u) => (
              <UpdateCard
                key={u.id}
                update={u}
                pending={pendingId === u.id}
                onAcknowledge={() => acknowledge(u)}
              />
            ))}
          </ul>
        )}
        <div className="flex w-full flex-col gap-3.5 lg:w-80">
          {contacts.length > 0 && <SideListCard title="Home contacts" rows={contacts} />}
          <SideListCard
            title="This week"
            variant="inline"
            rows={[
              { label: "Updates", value: String(thisWeek) },
              { label: "Need acknowledgement", value: String(waiting) },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
