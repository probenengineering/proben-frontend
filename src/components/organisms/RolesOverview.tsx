import { NoticeBanner, RoleSummaryCard } from "@/components/molecules";
import type { RolesOverviewData } from "@/lib/staff-api/roles";

import { PermissionMatrix } from "./PermissionMatrix";

// Roles & permissions body (Figma 103:20605): a card per role (12px apart; 4 a row on wide
// screens, 2 on tablets, stacked on phones), then the permission matrix and its note; 20px
// padding and gaps. Read-only. Roles and counts from GET /roles, rows from GET /permissions.
export interface RolesOverviewProps {
  data: RolesOverviewData;
}

export function RolesOverview({ data }: RolesOverviewProps) {
  if (data.error !== undefined) {
    return (
      <div className="px-5">
        <NoticeBanner message={data.error} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 px-5">
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.roles.map((role) => (
          <RoleSummaryCard key={role.id} role={role} />
        ))}
      </div>
      <PermissionMatrix roles={data.roles} groups={data.groups} />
    </div>
  );
}
