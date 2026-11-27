"use client";

import { Icon, RoleTag } from "@/components/atoms";
import { ProfileCard, StaffSummaryRow } from "@/components/molecules";
import { formatAddedDate } from "@/lib/staff";
import type { StaffProfile } from "@/lib/staff-profile";

// Right column of the staff profile (Figma "Side column" 103:18997), on every tab: Contact &
// employment (label / value rows, 120px labels) and Role & access (green 36px role tile, role
// name Semi Bold 14/20 over its description 12/17, permission chips 6px apart, and the last
// change in 12/17 slate-500). "Manage role" opens Assign role (left out without staff.manage).
// Someone with several roles shows them all, provider-wide first.
export interface StaffProfileAsideProps {
  profile: StaffProfile;
  onManageRole?: () => void;
}

export function StaffProfileAside({ profile, onManageRole }: StaffProfileAsideProps) {
  const { staff } = profile;
  const rows: [string, string][] = [
    ["Staff ID", staff.staffId],
    ["Email", staff.email],
    ["Phone", profile.phone || "Not added"],
    ["Employment type", profile.employmentType],
    ["Date added", staff.addedAt ? formatAddedDate(staff.addedAt) : "—"],
  ];
  const roleName = profile.roleNames.length ? profile.roleNames.join(", ") : "No role";
  return (
    <div className="flex w-full flex-col gap-4">
      <ProfileCard title="Contact & employment">
        <dl className="flex flex-col">
          {rows.map(([label, value], i) => (
            <StaffSummaryRow key={label} label={label} narrow divider={i < rows.length - 1}>
              <span className="break-all">{value}</span>
            </StaffSummaryRow>
          ))}
        </dl>
      </ProfileCard>
      <ProfileCard
        title="Role & access"
        action={onManageRole && { label: "Manage role", onClick: onManageRole }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-green-500/12">
            <Icon name="role-tile-18" size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="type-ui-14 font-semibold text-slate-900">{roleName}</span>
            {profile.roleDescription && (
              <span className="type-ui-12-17 text-slate-500">{profile.roleDescription}</span>
            )}
          </span>
        </div>
        {profile.permissions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.permissions.map((p) => (
              <RoleTag key={p} size="md">
                {p}
              </RoleTag>
            ))}
          </div>
        )}
        {profile.roleChange && <p className="type-ui-12-17 text-slate-500">{profile.roleChange}</p>}
      </ProfileCard>
    </div>
  );
}
