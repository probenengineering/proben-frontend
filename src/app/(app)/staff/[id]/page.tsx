import type { Metadata } from "next";

import { NoticeBanner } from "@/components/molecules";
import { DashboardHeader, StaffProfileView } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { getStaffProfilePage } from "@/lib/staff-api/profile";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page, keeping the current page on screen (with the
// progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Staff profile | Proben",
};

// Staff profile (Figma 103:18913; activity 103:19039; menu 103:19137; deactivate 103:19269) from
// the live API. ?tab=activity opens the Activity tab; ?assign=homes opens the Assign homes drawer
// (103:19679).
export default async function StaffProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[]; assign?: string | string[] }>;
}) {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("viewStaff");
  const [{ id }, { tab, assign }] = await Promise.all([params, searchParams]);
  const result = await getStaffProfilePage(id);
  return (
    <TasksTemplate header={<DashboardHeader title="Staff profile" action={null} />}>
      {result.ok ? (
        <StaffProfileView
          key={result.profile.staff.id}
          profile={result.profile}
          homeOptions={result.homeOptions}
          can={result.can}
          tab={tab === "activity" ? "activity" : "overview"}
          assignHomes={assign === "homes"}
        />
      ) : (
        <div className="px-5">
          <NoticeBanner message={`We couldn’t load this profile. ${result.error}`} />
        </div>
      )}
    </TasksTemplate>
  );
}
