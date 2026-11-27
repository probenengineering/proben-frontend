import { PermissionRow } from "@/components/molecules";
import type { PermissionGroup, StaffRole } from "@/lib/staff-roles";

// Right column of Assign role (Figma "Permission preview" 103:19461): slate-200 left border,
// 28px left padding, 20px gaps. "Access for <role>" (Inter Semi Bold 16/23 slate-900) over
// "What this role can do in ProBen. 12 of 25 permissions." (13/18 slate-500); then each catalogue
// group (GET /permissions): title Inter 15/16 slate-500 over its permission rows, ticked when the
// role's own permission list has it. Phones: below the roles, no border.
export interface RoleAccessPanelProps {
  role: StaffRole;
  groups: PermissionGroup[];
}

export function RoleAccessPanel({ role, groups }: RoleAccessPanelProps) {
  const granted = new Set(role.permissions);
  const total = groups.reduce((n, g) => n + g.permissions.length, 0);
  const held = groups.reduce(
    (n, g) => n + g.permissions.filter((p) => granted.has(p.id)).length,
    0,
  );
  return (
    <aside
      aria-live="polite"
      className="flex w-full flex-col gap-5 pt-1 pb-4.5 lg:w-100 lg:shrink-0 lg:border-l lg:border-slate-200 lg:pl-7"
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="type-ui-16-23 font-semibold text-slate-900">Access for {role.name}</h2>
        <p className="type-ui-13 text-slate-500">
          What this role can do in ProBen. {held} of {total} permissions.
        </p>
      </div>
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col">
          <h3 className="type-ui-15-16 text-slate-500">{group.title}</h3>
          <ul className="flex flex-col">
            {group.permissions.map((p) => (
              <PermissionRow key={p.id} label={p.label} granted={granted.has(p.id)} />
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
