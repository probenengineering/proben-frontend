import { InitialsAvatar } from "@/components/atoms";
import { STAFF_TINT_CLASSES, type StaffMember } from "@/lib/staff";

// The person a page is about (Figma "Staff member" 103:19447): slate-50 pill, slate-200 border,
// 6px left / 14px right / 6px padding, 10px gap. 32px initials avatar (Semi Bold 12/17); name
// Inter Semi Bold 13/18 slate-900 over "Current role:" (12/17 slate-500) + role (Medium grey-700).
export interface StaffChipProps {
  staff: StaffMember;
}

export function StaffChip({ staff }: StaffChipProps) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-3.5 pl-1.5">
      <InitialsAvatar
        name={staff.name}
        size={32}
        tintClassName={STAFF_TINT_CLASSES[staff.tint]}
        photoSrc={staff.photoSrc}
      />
      <span className="flex flex-col">
        <span className="type-ui-13 font-semibold text-slate-900">{staff.name}</span>
        <span className="flex gap-1 type-ui-12-17">
          <span className="text-slate-500">Current role:</span>
          <span className="font-medium text-grey-700">{staff.role}</span>
        </span>
      </span>
    </div>
  );
}
