"use client";

import { useState } from "react";

import { InitialsAvatar, RoleTag, StatePill, type StatePillTone } from "@/components/atoms";
import {
  formatAddedDate,
  STAFF_TINT_CLASSES,
  type StaffMember,
  type StaffStatus,
} from "@/lib/staff";
import { cn } from "@/lib/utils";

import { STAFF_TABLE_COLUMNS as C } from "./StaffTableHeader";
import { type StaffRowAction, StaffRowMenu } from "./StaffRowMenu";

// One person in the All staff table (Figma "Staff Row" 103:18400): white, slate-200 divider,
// 16 × 12 padding, 16px gaps. 40px initials avatar; name Inter Semi Bold 14/20 slate-900 over the
// email (12/17 slate-500); staff ID 13/18 grey-700; role tag; first home (13/18 grey-700) over
// "+1 more" (12/17 slate-500), or "No homes" in grey-400; status pill; date added 13/18
// slate-500; ⋯ menu. The row turns slate-50 while its menu is open (103:18456).

const STATUS: Record<StaffStatus, { tone: StatePillTone; label: string }> = {
  active: { tone: "success", label: "Active" },
  pending: { tone: "warning", label: "Pending invitation" },
  inactive: { tone: "neutral", label: "Inactive" },
};

export interface StaffRowProps {
  staff: StaffMember;
  canManage?: boolean;
  canAssignTasks?: boolean;
  onAction: (action: StaffRowAction, staff: StaffMember) => void;
}

export function StaffRow({ staff, canManage, canAssignTasks, onAction }: StaffRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstHome, ...otherHomes] = staff.homes;
  // Created without sending the invitation (sendInvite: false): same tone, "Not invited".
  const status = staff.notInvited
    ? { ...STATUS.pending, label: "Not invited" }
    : STATUS[staff.status];

  return (
    <li
      className={cn(
        "flex items-center gap-3 border-b border-slate-200 px-4 py-3 transition-colors duration-150 md:gap-4",
        menuOpen ? "bg-slate-50" : "bg-white hover:bg-slate-50/70",
      )}
    >
      <span className={cn("flex items-center gap-3", C.staff)}>
        <InitialsAvatar
          name={staff.name}
          size={40}
          tintClassName={STAFF_TINT_CLASSES[staff.tint]}
          photoSrc={staff.photoSrc}
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate type-ui-14 font-semibold text-slate-900">{staff.name}</span>
          <span className="truncate type-ui-12-17 text-slate-500">{staff.email}</span>
        </span>
      </span>
      <span className={cn("items-center type-ui-13 text-grey-700", C.staffId)}>
        {staff.staffId}
      </span>
      {/* A person can hold several roles (e.g. Care staff, plus Home manager in one home). */}
      <span className={cn("min-w-0 items-center gap-1", C.role)}>
        <RoleTag>{staff.role}</RoleTag>
        {staff.otherRoles && staff.otherRoles.length > 0 ? (
          <span
            className="shrink-0 type-ui-12-17 text-slate-500"
            title={staff.otherRoles.join(", ")}
          >
            +{staff.otherRoles.length}
          </span>
        ) : null}
      </span>
      <span className={cn("min-w-0 flex-col gap-0.5", C.homes)}>
        {firstHome ? (
          <>
            <span className="truncate type-ui-13 text-grey-700">{firstHome}</span>
            {otherHomes.length > 0 && (
              <span className="type-ui-12-17 text-slate-500">+{otherHomes.length} more</span>
            )}
          </>
        ) : (
          <span className="type-ui-13 text-grey-400">No homes</span>
        )}
      </span>
      <span className={cn("items-center", C.status)}>
        <StatePill tone={status.tone}>{status.label}</StatePill>
      </span>
      <span className={cn("items-center type-ui-13 text-slate-500", C.added)}>
        {formatAddedDate(staff.addedAt)}
      </span>
      <span className={cn("items-center", C.actions)}>
        <StaffRowMenu
          staff={staff}
          canManage={canManage}
          canAssignTasks={canAssignTasks}
          onAction={(action) => onAction(action, staff)}
          onOpenChange={setMenuOpen}
        />
      </span>
    </li>
  );
}
