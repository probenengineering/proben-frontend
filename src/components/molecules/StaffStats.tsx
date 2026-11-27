import type { StaffCounts } from "@/lib/staff";

import { InlineStats } from "./InlineStats";

// All staff summary line (Figma "Inline stats" 103:18373). Loading (103:18518): counts undefined,
// shown as "—".
export interface StaffStatsProps {
  counts?: StaffCounts;
}

export function StaffStats({ counts }: StaffStatsProps) {
  return (
    <InlineStats
      stats={[
        { icon: "stat-people-16", value: counts?.total, label: "staff" },
        { icon: "stat-active-staff-16", value: counts?.active, label: "active" },
        {
          icon: "stat-invite-16",
          value: counts?.pending,
          label: counts?.pending === 1 ? "pending invitation" : "pending invitations",
        },
        { icon: "stat-inactive-16", value: counts?.inactive, label: "inactive" },
      ]}
    />
  );
}
