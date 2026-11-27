"use client";

import { useId } from "react";

import { Toggle } from "@/components/atoms";

// "Send account invitation" row (Figma "Invitation" 103:18710): the toggle, then the title (Inter
// Medium 14/20 grey-700) over the hint (13/18 slate-500), 12px apart.
export interface InvitationToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function InvitationToggle({ checked, onChange }: InvitationToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Toggle
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-hint`}
      />
      <span className="flex flex-col">
        <span id={`${id}-title`} className="type-ui-14 font-medium text-grey-700">
          Send account invitation
        </span>
        <span id={`${id}-hint`} className="type-ui-13 text-slate-500">
          Emails a link to set up their ProBen account.
        </span>
      </span>
    </div>
  );
}
