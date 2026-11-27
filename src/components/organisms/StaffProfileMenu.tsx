"use client";

import { useState } from "react";

import { Icon, type IconName } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import type { StaffStatus } from "@/lib/staff";
import { cn } from "@/lib/utils";

// The ⋯ on the staff profile and its menu (Figma "More actions menu" 103:19263): a 38px outline
// icon button (grey-300 border, 8px padding); the menu matches the staff row menu (12px radius,
// slate-200 border, 6px padding, row-menu shadow, 216px items, hover slate-50). Resend
// invitation is greyed (45%) unless the invitation is still pending ("Send invitation" when it
// was never sent). Deactivate is red; once the person is inactive it becomes Reactivate (no
// Figma frame, same row style in grey-700).
export type StaffProfileAction = "role" | "homes" | "invite" | "deactivate" | "reactivate";

export interface StaffProfileMenuProps {
  name: string;
  status: StaffStatus;
  /** Invited, but the invitation was never sent. */
  notInvited: boolean;
  /** While a change is saving. */
  disabled?: boolean;
  onAction: (action: StaffProfileAction) => void;
}

function Item(props: {
  icon: IconName;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={props.disabled}
      onClick={props.onClick}
      className={cn(
        "flex w-54 items-center gap-2.5 rounded-[8px] px-3 py-[9px] text-left type-ui-14 font-medium outline-none focus-visible:bg-slate-50 enabled:hover:bg-slate-50 disabled:opacity-45",
        props.danger ? "text-danger-600" : "text-grey-700",
      )}
    >
      <Icon name={props.icon} size={18} />
      {props.label}
    </button>
  );
}

export function StaffProfileMenu({
  name,
  status,
  notInvited,
  disabled,
  onAction,
}: StaffProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const pick = (action: StaffProfileAction) => {
    setOpen(false);
    onAction(action);
  };
  const inactive = status === "inactive";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`More actions for ${name}`}
        className="flex size-9.5 items-center justify-center rounded-full border border-grey-300 bg-white hover:bg-slate-50"
      >
        <Icon name="more-20" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="flex w-auto flex-col gap-0.5 rounded-[12px] border border-slate-200 bg-white p-1.5 shadow-row-menu ring-0"
      >
        <div role="menu" aria-label={`Actions for ${name}`} className="flex flex-col gap-0.5">
          <Item
            icon="menu-role-18"
            label="Assign role"
            disabled={disabled || inactive}
            onClick={() => pick("role")}
          />
          <Item
            icon="menu-homes-18"
            label="Assign homes"
            disabled={disabled || inactive}
            onClick={() => pick("homes")}
          />
          <Item
            icon="menu-invite-18"
            label={notInvited ? "Send invitation" : "Resend invitation"}
            disabled={disabled || status !== "pending"}
            onClick={() => pick("invite")}
          />
          <span className="h-px w-54 bg-slate-200" />
          {inactive ? (
            <Item
              icon="menu-people-18"
              label="Reactivate"
              disabled={disabled}
              onClick={() => pick("reactivate")}
            />
          ) : (
            <Item
              icon="menu-deactivate-18"
              label="Deactivate"
              danger
              disabled={disabled}
              onClick={() => pick("deactivate")}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
