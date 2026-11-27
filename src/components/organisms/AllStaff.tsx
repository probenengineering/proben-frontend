"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { NoticeBanner, StaffStats, type StaffRowAction } from "@/components/molecules";
import { useStaffFilters } from "@/hooks/useStaffFilters";
import type { StaffMember } from "@/lib/staff";
import {
  deactivateStaffAction,
  reactivateStaffAction,
  resendInviteAction,
  type StaffPageResult,
} from "@/lib/staff-api/actions";
import { openTaskCountAction } from "@/lib/staff-api/directory-actions";
import { showToast } from "@/lib/toast";

import { AddStaffButton } from "./AddStaffButton";
import { DeactivateStaffDialog } from "./DeactivateStaffDialog";
import { StaffEmpty } from "./StaffEmpty";
import { StaffTable } from "./StaffTable";
import { StaffToolbar } from "./StaffToolbar";

// All staff body (Figma 103:18355): stats, toolbar, table; 20px padding and gaps. `initial`
// undefined = loading (103:18500), or `error` when the list couldn't load; nobody in scope =
// "No staff members yet" (103:18475). Live from GET /staff; row actions invite, deactivate
// (confirmed with the profile's dialog, 103:19396) and reactivate. Edit details isn't designed.
export interface AllStaffProps {
  initial?: StaffPageResult;
  error?: string;
  canManage?: boolean;
  canAssignTasks?: boolean;
}

interface Pending {
  staff: StaffMember;
  openTasks: number;
}

function Loaded({
  initial,
  canManage,
  canAssignTasks,
}: AllStaffProps & { initial: StaffPageResult }) {
  const filters = useStaffFilters(initial);
  const router = useRouter();
  const [deactivating, setDeactivating] = useState<Pending | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // The action already refreshed the page's server data; re-run the current page of the list.
  const changed = () => filters.reload();

  const onAction = async (action: StaffRowAction, person: StaffMember) => {
    switch (action) {
      case "view":
        return router.push(`/staff/${person.id}`);
      case "role":
        return router.push(`/staff/${person.id}/role`);
      case "homes":
        return router.push(`/staff/${person.id}?assign=homes`);
      case "task":
        return router.push(`/staff/tasks/new?staff=${person.id}`);
      case "edit":
        return showToast("error", "Editing staff details isn’t available yet.");
      case "invite": {
        const result = await resendInviteAction(person.id);
        if (!result.ok) return showToast("error", result.error);
        showToast("success", `Invitation sent to ${person.email}.`);
        return changed();
      }
      case "reactivate": {
        const result = await reactivateStaffAction(person.id);
        if (!result.ok) return showToast("error", result.error);
        showToast("success", `${person.name} can sign in again.`);
        return changed();
      }
      case "deactivate": {
        // The dialog says how many open tasks stay assigned; unknown counts read as none.
        const openTasks = (await openTaskCountAction(person.id)) ?? 0;
        setDeactivating({ staff: person, openTasks });
        return setConfirmOpen(true);
      }
    }
  };

  const deactivate = async () => {
    if (!deactivating || busy) return;
    setBusy(true);
    const result = await deactivateStaffAction(deactivating.staff.id);
    setBusy(false);
    setConfirmOpen(false);
    if (!result.ok) return showToast("error", result.error);
    showToast("success", `${deactivating.staff.name} has been deactivated.`);
    changed();
  };

  return (
    <>
      <StaffStats counts={filters.counts} />
      <StaffToolbar filters={filters} />
      {filters.error && <NoticeBanner message={filters.error} />}
      <StaffTable
        filters={filters}
        canManage={canManage}
        canAssignTasks={canAssignTasks}
        onAction={(action, person) => void onAction(action, person)}
      />
      {deactivating && (
        <DeactivateStaffDialog
          name={deactivating.staff.name}
          homes={deactivating.staff.homes.length}
          openTasks={deactivating.openTasks}
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={() => void deactivate()}
        />
      )}
    </>
  );
}

export function AllStaff({ initial, error, canManage, canAssignTasks }: AllStaffProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col gap-5 px-5">
      {!initial ? (
        <>
          <StaffStats />
          {error ? (
            <NoticeBanner message={error} />
          ) : (
            <>
              <StaffToolbar />
              <StaffTable />
            </>
          )}
        </>
      ) : initial.counts.all === 0 ? (
        <StaffEmpty action={canManage ? <AddStaffButton icon="user-add-empty-18" /> : null} />
      ) : (
        <Loaded initial={initial} canManage={canManage} canAssignTasks={canAssignTasks} />
      )}
    </div>
  );
}
