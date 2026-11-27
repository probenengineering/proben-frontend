import { Icon, RoleTag } from "@/components/atoms";
import type { StaffRole } from "@/lib/staff-roles";

// A role on Roles & permissions (Figma "Role / Administrator" 103:20623): white, slate-200 border,
// 16px radius (no radius token yet), 16px padding, 8px gaps. 32px green-500/12 tile (10px radius)
// with a 16px shield, name Inter Semi Bold 15/21 slate-900, and "1 staff" (Medium 12/17
// slate-500) on the right (long API role names wrap); the description (13/18 slate-500); the
// scope chip.
export interface RoleSummaryCardProps {
  role: Pick<StaffRole, "name" | "description" | "scope" | "staff">;
}

export function RoleSummaryCard({ role }: RoleSummaryCardProps) {
  return (
    <section className="flex flex-col items-start gap-2 rounded-[16px] border border-slate-200 bg-white p-4">
      <div className="flex w-full items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-green-500/12">
          <Icon name="role-tile-16" size={16} />
        </span>
        <h2 className="min-w-0 flex-1 type-ui-15-21 font-semibold text-slate-900">{role.name}</h2>
        <span className="shrink-0 type-ui-12-17 font-medium text-slate-500">
          {role.staff} staff
        </span>
      </div>
      <p className="type-ui-13 text-slate-500">{role.description}</p>
      <RoleTag>{role.scope}</RoleTag>
    </section>
  );
}
