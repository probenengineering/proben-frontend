import { Icon, type IconName } from "@/components/atoms";
import { PermissionCell } from "@/components/molecules";
import { buildMatrix } from "@/lib/role-matrix";
import type { PermissionGroup, StaffRole } from "@/lib/staff-roles";

// Permission matrix (Figma "Permission matrix" 103:20663): white, slate-200 border, 12px radius.
// Header (slate-50, 16 × 10): "Permission", then a centred column per role (Medium 12/17
// slate-500, 144px each; long names wrap). Rows (16 × 11, slate-200 dividers): the catalogue group
// (Semi Bold 11/16 grey-400; shown on a group's first row only) and the permission (Medium 14/20
// slate-900; long catalogue labels wrap), then one cell per role. Scrolls sideways when the roles
// don't fit. The footnote (16px grey info icon, 12/17 slate-500) sits underneath.
// Deviations from Figma: a 400px permission column and 92px group labels (Figma: 334 / 70px),
// since the API's labels and "Administration" are longer than the design's.
export interface PermissionMatrixProps {
  roles: StaffRole[];
  groups: PermissionGroup[];
}

const NOTE_ICON: IconName = "info-grey-16";

export function PermissionMatrix({ roles, groups }: PermissionMatrixProps) {
  const rows = buildMatrix(roles, groups);
  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto rounded-[12px] border border-slate-200 bg-white">
        <table className="w-full min-w-224 table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                scope="col"
                className="w-100 py-2.5 pl-4 text-left type-ui-12-17 font-medium text-slate-500"
              >
                Permission
              </th>
              {roles.map((r) => (
                <th
                  key={r.id}
                  scope="col"
                  className="w-36 px-2 py-2.5 text-center type-ui-12-17 font-medium text-slate-500 last:pr-4"
                >
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const firstOfGroup = i === 0 || rows[i - 1].group !== row.group;
              return (
                <tr
                  key={`${row.group}:${row.permission}`}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <th scope="row" className="py-[11px] pl-4 text-left font-normal">
                    <span className="flex min-h-5 items-start gap-2">
                      <span
                        className={`w-23 shrink-0 pt-0.5 type-ui-11-16 font-semibold text-grey-400 ${firstOfGroup ? "" : "invisible"}`}
                      >
                        {row.group}
                      </span>
                      <span className="min-w-0 type-ui-14 font-medium text-slate-900">
                        {row.permission}
                      </span>
                    </span>
                  </th>
                  {row.grants.map((grant, j) => (
                    <td key={roles[j].id} className="px-2 py-[11px] last:pr-4">
                      <span className="flex justify-center">
                        <PermissionCell grant={grant} />
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="flex items-center gap-2 type-ui-12-17 text-slate-500">
        <Icon name={NOTE_ICON} size={16} />
        <span className="min-w-0 flex-1">
          Each role’s own permissions in ProBen. “Assigned homes” applies only in the homes the role
          is given for; a tick on its own goes with the person wherever they work.
        </span>
      </p>
    </div>
  );
}
