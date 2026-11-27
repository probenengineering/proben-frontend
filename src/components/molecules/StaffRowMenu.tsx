"use client";

import type { StaffMember } from "@/lib/staff";

import { type RowAction, RowActionMenu } from "./RowActionMenu";

// The ⋯ on a staff row (Figma "Row actions menu" 103:18467): View profile, Edit details, Assign
// role, Assign homes, Assign task, then the red Deactivate. Beyond Figma: "Resend invite" ("Send
// invite" when it was never sent) for pending people, and Reactivate in place of Deactivate for
// inactive people. Items the signed-in person can't use are left out (the backend still checks).
export type StaffRowAction =
  "view" | "edit" | "role" | "homes" | "task" | "invite" | "reactivate" | "deactivate";

export interface StaffRowMenuProps {
  staff: Pick<StaffMember, "name" | "status" | "notInvited">;
  /** staff.manage: edit, role, homes, invitations, deactivate / reactivate. */
  canManage?: boolean;
  /** tasks.assign: Assign task. */
  canAssignTasks?: boolean;
  onAction: (action: StaffRowAction) => void;
  onOpenChange?: (open: boolean) => void;
}

function itemsFor({
  staff,
  canManage,
  canAssignTasks,
}: Omit<StaffRowMenuProps, "onAction" | "onOpenChange">): RowAction<StaffRowAction>[] {
  const inactive = staff.status === "inactive";
  const items: (RowAction<StaffRowAction> | false | undefined)[] = [
    { action: "view", icon: "menu-people-18", label: "View profile" },
    canManage && { action: "edit", icon: "menu-edit-18", label: "Edit details" },
    canManage && { action: "role", icon: "menu-role-18", label: "Assign role" },
    canManage && { action: "homes", icon: "menu-homes-18", label: "Assign homes" },
    canAssignTasks && !inactive && { action: "task", icon: "menu-task-18", label: "Assign task" },
    canManage &&
      staff.status === "pending" && {
        action: "invite",
        icon: "menu-invite-18",
        label: staff.notInvited ? "Send invite" : "Resend invite",
      },
    canManage && inactive && { action: "reactivate", icon: "menu-people-18", label: "Reactivate" },
    canManage &&
      !inactive && {
        action: "deactivate",
        icon: "menu-deactivate-18",
        label: "Deactivate",
        danger: true,
      },
  ];
  return items.filter((i): i is RowAction<StaffRowAction> => !!i);
}

export function StaffRowMenu({ onAction, onOpenChange, ...props }: StaffRowMenuProps) {
  return (
    <RowActionMenu
      label={`Actions for ${props.staff.name}`}
      items={itemsFor(props)}
      onAction={onAction}
      onOpenChange={onOpenChange}
    />
  );
}
