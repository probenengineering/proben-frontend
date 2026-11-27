import type { ReactNode } from "react";

import { InitialsAvatar, RoleTag, StatePill, type StatePillTone } from "@/components/atoms";
import { STAFF_TINT_CLASSES, type StaffMember, type StaffStatus } from "@/lib/staff";

// Staff profile identity row (Figma "Profile" 103:18938): 64px initials avatar, 16px gap; name
// (Inter Medium 22/31 black) with the role tag and status pill (10px apart), over "ID · email ·
// phone" (14/20 slate-500), 6px apart; the action buttons on the right (`actions`). Phones: the
// actions wrap underneath. "Not invited" (warning) when the invitation was never sent; the
// profile photo replaces the initials when there is one.
export interface StaffProfileHeaderProps {
  staff: StaffMember;
  /** Left out of the line when empty. */
  phone?: string;
  actions: ReactNode;
}

const STATUS: Record<StaffStatus, { tone: StatePillTone; label: string }> = {
  active: { tone: "success", label: "Active" },
  pending: { tone: "warning", label: "Pending invitation" },
  inactive: { tone: "neutral", label: "Inactive" },
};

export function StaffProfileHeader({ staff, phone, actions }: StaffProfileHeaderProps) {
  const status = staff.notInvited
    ? { ...STATUS.pending, label: "Not invited" }
    : STATUS[staff.status];
  return (
    <div className="flex w-full flex-wrap items-center gap-4">
      <InitialsAvatar
        name={staff.name}
        size={64}
        tintClassName={STAFF_TINT_CLASSES[staff.tint]}
        photoSrc={staff.photoSrc}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h1 className="type-ui-22-31 font-medium text-black">{staff.name}</h1>
          <RoleTag>{staff.role}</RoleTag>
          <StatePill tone={status.tone}>{status.label}</StatePill>
        </div>
        <p className="type-ui-14 break-words whitespace-pre-wrap text-slate-500">
          {[staff.staffId, staff.email, phone].filter(Boolean).join("  ·  ")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4 max-md:w-full">{actions}</div>
    </div>
  );
}
