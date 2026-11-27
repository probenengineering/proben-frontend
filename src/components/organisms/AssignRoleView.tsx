"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/atoms";
import {
  Breadcrumb,
  NoticeBanner,
  RoleOption,
  StaffChip,
  StickyActionBar,
} from "@/components/molecules";
import { setStaffRolesAction } from "@/lib/staff-api/actions";
import type { AssignRoleData } from "@/lib/staff-api/roles";
import { accessChanges, assignmentsFor, type StaffRole } from "@/lib/staff-roles";
import { showToast } from "@/lib/toast";

import { ChangeRoleDialog } from "./ChangeRoleDialog";
import { RoleAccessPanel } from "./RoleAccessPanel";

// Assign role (Figma 103:19418; confirm 103:19494; locked roles 103:19600). Breadcrumb and the
// staff chip; "Available roles" (Inter 15/18 slate-500) with the role cards (4px apart, 28px right
// padding) beside the access panel; the action bar with Cancel and Save role. Roles come from
// GET /roles?staffId: a role the API marks not assignable is locked, with the blue note. Saving
// replaces all their roles with the chosen one (PUT /staff/{id}/roles): a home role once per home
// they belong to, an organisation role provider-wide.
export type AssignRoleViewProps = { data: AssignRoleData } | { error: string };

const REASONS = {
  "no-homes": (first: string) => `Add ${first} to a home first. This role is given per home.`,
  "no-allowed-homes": (first: string) => `You can’t give this role in ${first}’s homes.`,
  "not-allowed": () => "You can’t give this role.",
};

function homesNote(count: number) {
  return count === 1 ? "for their home" : `for their ${count} homes`;
}

export function AssignRoleView(props: AssignRoleViewProps) {
  if ("error" in props) {
    return (
      <div className="p-5">
        <NoticeBanner message={props.error} />
      </div>
    );
  }
  return <Loaded data={props.data} />;
}

function Loaded({ data }: { data: AssignRoleData }) {
  const { staff, firstName, homeIds, currentRoleIds, currentPermissions, roles, groups } = data;
  const router = useRouter();
  const current = new Set(currentRoleIds);
  const initial =
    roles.find((r) => current.has(r.id)) ?? roles.find((r) => r.assignable) ?? roles[0];
  const [selected, setSelected] = useState<string | undefined>(initial?.id);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const role = roles.find((r) => r.id === selected);
  const profile = `/staff/${staff.id}`;

  const plan = role ? assignmentsFor(role, homeIds) : undefined;
  const blocked = plan && "reason" in plan ? REASONS[plan.reason](firstName) : undefined;
  // Already exactly this role (and nothing else): nothing to save.
  const unchanged = !!role && current.size === 1 && current.has(role.id);
  const anyLocked = roles.some((r) => !r.assignable);
  const fromNames = roles.filter((r) => current.has(r.id)).map((r) => r.name);
  const changes = role
    ? accessChanges(currentPermissions, role.permissions, groups)
    : { gains: [], loses: [] };
  const perHome = plan && "roles" in plan && plan.roles.some((r) => r.homeId);

  const save = async () => {
    if (!role || !plan || !("roles" in plan)) return;
    setSaving(true);
    const result = await setStaffRolesAction(staff.id, plan.roles);
    if (!result.ok) {
      setSaving(false);
      setConfirming(false);
      return showToast(
        "error",
        result.code === "STAFF_HOME_MISMATCH"
          ? `${firstName}’s homes have changed. Refresh and try again.`
          : result.status === 403
            ? "You don’t have permission to give this role."
            : result.error,
      );
    }
    // The dialog stays on "Changing…" until the profile (already refreshed by the action) is on
    // screen, so nothing can be clicked twice in between.
    showToast("success", `${staff.name} is now ${role.name}.`);
    router.push(profile);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Breadcrumb
            parent={{ label: "All staff", href: "/staff" }}
            trail={[{ label: staff.name, href: profile }]}
            current="Assign role"
          />
          <StaffChip staff={staff} />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-0">
          <div
            role="radiogroup"
            aria-label="Available roles"
            className="flex min-w-0 flex-1 flex-col gap-1 lg:pr-7"
          >
            <p className="type-ui-15-18 text-slate-500">Available roles</p>
            {anyLocked && (
              <NoticeBanner
                tone="info"
                message="You can only give roles whose access you hold yourself, in homes you manage."
              />
            )}
            {roles.map((r: StaffRole) => (
              <RoleOption
                key={r.id}
                role={r}
                selected={r.id === selected}
                current={current.has(r.id)}
                locked={!r.assignable}
                onSelect={() => setSelected(r.id)}
              />
            ))}
          </div>
          {role && <RoleAccessPanel role={role} groups={groups} />}
        </div>
      </div>
      <StickyActionBar note={blocked ?? `${firstName} will be notified when the role changes.`}>
        <Button
          variant="ghost"
          size="pill-lg"
          render={<Link href={profile} />}
          nativeButton={false}
        >
          Cancel
        </Button>
        <Button
          variant="green"
          size="pill-lg"
          disabled={!role || unchanged || !!blocked || !role.assignable}
          onClick={() => setConfirming(true)}
        >
          Save role
        </Button>
      </StickyActionBar>
      {role && (
        <ChangeRoleDialog
          name={staff.name}
          from={fromNames}
          to={role}
          gains={changes.gains}
          loses={changes.loses}
          scopeNote={perHome && plan && "roles" in plan ? homesNote(plan.roles.length) : undefined}
          saving={saving}
          open={confirming}
          onOpenChange={(open) => !saving && setConfirming(open)}
          onConfirm={() => void save()}
        />
      )}
    </div>
  );
}
