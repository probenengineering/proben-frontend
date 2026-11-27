"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { Button, Icon } from "@/components/atoms";
import { Breadcrumb, DetailTabs, StaffProfileHeader } from "@/components/molecules";
import type { StaffMember } from "@/lib/staff";
import {
  deactivateStaffAction,
  reactivateStaffAction,
  resendInviteAction,
  setStaffHomesAction,
} from "@/lib/staff-api/actions";
import type { HomeOption, ProfileAbilities, ProfileHome, StaffProfile } from "@/lib/staff-profile";
import { showActionToast, showToast } from "@/lib/toast";

import { AssignHomesDrawer } from "./AssignHomesDrawer";
import { DeactivateStaffDialog } from "./DeactivateStaffDialog";
import { StaffProfileAside } from "./StaffProfileAside";
import { type StaffProfileAction, StaffProfileMenu } from "./StaffProfileMenu";
import { StaffProfileActivity, StaffProfileOverview } from "./StaffProfileTabs";

// Staff profile (Figma 103:18913 overview, 103:19039 activity, 103:19137 menu, 103:19269
// deactivate): breadcrumb, identity row with Edit details / Assign task / ⋯, tabs, then the tab
// body (722px) beside the side column (380px), 16px apart; stacked below lg. Role & access,
// Assigned homes and Tasks tabs aren't designed yet (shown, disabled). Live: Assign homes
// (103:19679 → 103:20036) saves the complete set (Undo resends the previous one); Deactivate,
// Reactivate and invitations call the staff API, which refreshes this page's data in the same
// response, so dialogs close and toasts show only once the screen is current. Actions the
// signed-in person can't take are hidden (`can`).
export interface StaffProfileViewProps {
  profile: StaffProfile;
  /** The organisation's active homes, for Assign homes. */
  homeOptions: HomeOption[] | null;
  can: ProfileAbilities;
  tab: "overview" | "activity";
  /** Open the Assign homes drawer on arrival (?assign=homes, e.g. from All staff). */
  assignHomes?: boolean;
}

const soon = () => showToast("error", "This isn’t available yet.");

type HomeSet = { homeId: string; isPrimary?: boolean }[];

const today = () =>
  `Assigned ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

export function StaffProfileView({
  profile,
  homeOptions,
  can,
  tab,
  assignHomes,
}: StaffProfileViewProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [drawer, setDrawer] = useState<{ remove?: string } | null>(
    assignHomes && can.manage ? {} : null,
  );
  // Changes show on screen at once (optimistic: homes, status, invitation) and stay until the
  // save and the refreshed page data land; a failed save puts things back with an error toast.
  const [staff, showStaff] = useOptimistic(profile.staff);
  const [homes, showHomes] = useOptimistic(profile.homes);
  const [saving, startSaving] = useTransition();
  const base = `/staff/${staff.id}`;

  /** The rows a home set will show: known homes keep their details; new ones come from options. */
  const rowsFor = (set: HomeSet): ProfileHome[] =>
    set.map(({ homeId, isPrimary }) => {
      const known = homes.find((h) => h.id === homeId);
      if (known) return { ...known, isPrimary: !!isPrimary };
      const option = homeOptions?.find((o) => o.id === homeId);
      return {
        id: homeId,
        name: option?.name ?? "Home",
        detail: option?.detail ?? "",
        assignedOn: today(),
        isPrimary: !!isPrimary,
      };
    });

  const saveHomes = (next: HomeSet, previous: HomeSet, undoing = false) => {
    setDrawer(null);
    startSaving(async () => {
      showHomes(rowsFor(next));
      const result = await setStaffHomesAction(staff.id, next);
      if (!result.ok) return void showToast("error", result.error);
      if (undoing) return void showToast("success", "Home assignments restored.");
      showActionToast("Home assignments updated.", "Undo", () => saveHomes(previous, next, true), {
        duration: 10_000,
      });
    });
  };

  const applyHomes = ({ added, removed }: { added: string[]; removed: string[] }) => {
    const previous: HomeSet = homes.map((h) => ({ homeId: h.id, isPrimary: h.isPrimary }));
    const kept = homes.filter((h) => !removed.includes(h.id));
    const ids = [...kept.map((h) => h.id), ...added];
    // Keep the current primary home; otherwise the first remaining one becomes primary.
    const primary = kept.find((h) => h.isPrimary)?.id ?? ids[0];
    saveHomes(
      ids.map((homeId) => ({ homeId, isPrimary: homeId === primary })),
      previous,
    );
  };

  const run = (
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
    done: string,
    shown: Partial<StaffMember>,
  ) => {
    setConfirming(false);
    startSaving(async () => {
      showStaff({ ...staff, ...shown });
      const result = await action();
      showToast(result.ok ? "success" : "error", result.ok ? done : result.error);
    });
  };

  const assignRole = () => router.push(`${base}/role`);
  const assignTask = () => router.push(`/staff/tasks/new?staff=${staff.id}`);
  const invite = () =>
    run(
      () => resendInviteAction(staff.id),
      staff.notInvited
        ? `Invitation sent to ${staff.email}.`
        : `Invitation resent to ${staff.email}.`,
      { notInvited: false },
    );

  const onMenu = (action: StaffProfileAction) =>
    action === "deactivate"
      ? setConfirming(true)
      : action === "reactivate"
        ? run(() => reactivateStaffAction(staff.id), `${staff.name} has been reactivated.`, {
            // Back to Active only if they'd activated before; otherwise they're invited again.
            status: staff.everActive ? "active" : "pending",
          })
        : action === "role"
          ? assignRole()
          : action === "homes"
            ? setDrawer({})
            : invite();

  return (
    <div className="flex w-full flex-col gap-4 px-5">
      <div className="flex flex-col gap-3">
        <Breadcrumb parent={{ label: "All staff", href: "/staff" }} current={staff.name} />
        <StaffProfileHeader
          staff={staff}
          phone={profile.phone}
          actions={
            <>
              {can.manage && (
                <Button variant="outline" size="pill-lg" onClick={soon}>
                  <Icon name="edit-18" size={18} />
                  Edit details
                </Button>
              )}
              {can.assignTasks && staff.status !== "inactive" && (
                <Button variant="green" size="pill-lg" onClick={assignTask}>
                  <Icon name="task-white-18" size={18} />
                  Assign task
                </Button>
              )}
              {can.manage && (
                <StaffProfileMenu
                  name={staff.name}
                  status={staff.status}
                  notInvited={!!staff.notInvited}
                  disabled={saving}
                  onAction={onMenu}
                />
              )}
            </>
          }
        />
      </div>
      <DetailTabs
        selected={tab}
        tabs={[
          { id: "overview", label: "Overview", href: base },
          { id: "role", label: "Role & access", disabled: true },
          { id: "homes", label: `Assigned homes · ${homes.length}`, disabled: true },
          { id: "tasks", label: `Tasks · ${profile.taskTotal}`, disabled: true },
          { id: "activity", label: "Activity", href: `${base}?tab=activity` },
        ]}
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        {tab === "activity" ? (
          <StaffProfileActivity profile={{ ...profile, staff, homes }} onSoon={soon} />
        ) : (
          <StaffProfileOverview
            profile={{ ...profile, staff, homes }}
            onSoon={soon}
            onAssignHomes={can.manage ? (remove) => setDrawer({ remove }) : undefined}
            onAssignTask={can.assignTasks && staff.status !== "inactive" ? assignTask : undefined}
          />
        )}
        <StaffProfileAside
          profile={{ ...profile, staff, homes }}
          onManageRole={can.manage ? assignRole : undefined}
        />
      </div>
      {can.manage && (
        <AssignHomesDrawer
          open={!!drawer}
          staff={staff}
          homes={homes}
          options={homeOptions}
          onRetry={() => router.refresh()}
          saving={saving}
          initialRemoved={drawer?.remove ? [drawer.remove] : []}
          onClose={() => setDrawer(null)}
          onConfirm={applyHomes}
        />
      )}
      <DeactivateStaffDialog
        name={staff.name}
        homes={homes.length}
        openTasks={profile.openTasks}
        open={confirming}
        pending={saving}
        onOpenChange={setConfirming}
        onConfirm={() =>
          run(() => deactivateStaffAction(staff.id), `${staff.name} has been deactivated.`, {
            status: "inactive",
          })
        }
      />
    </div>
  );
}
