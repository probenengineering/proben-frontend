import { Icon } from "@/components/atoms";
import type { PermissionGrant } from "@/lib/role-matrix";

// One cell of the permission matrix (Figma 103:20679 / 103:20684 / 103:20704 / 103:20690),
// centred: "org" = 18px green tick + "Organization-wide" (Inter 12/17 grey-700, 6px gap); "scope"
// = info-50 pill (999px, 8 × 2, Medium 12/17 info-700), e.g. "Assigned homes"; "granted" = the
// tick alone (a personal permission, no Figma frame); "if-permitted" = caution-50 pill in
// caution-700; "none" = 18px grey ✕.
export interface PermissionCellProps {
  grant: PermissionGrant;
}

const PILL = "rounded-full px-2 py-0.5 type-ui-12-17 font-medium whitespace-nowrap";

export function PermissionCell({ grant }: PermissionCellProps) {
  switch (grant.kind) {
    case "org":
      return (
        <span className="flex items-center gap-1.5 type-ui-12-17 whitespace-nowrap text-grey-700">
          <Icon name="perm-on-18" size={18} />
          Organization-wide
        </span>
      );
    case "granted":
      return <Icon name="perm-on-18" size={18} alt="Included" />;
    case "scope":
      return <span className={`${PILL} bg-info-50 text-info-700`}>{grant.label}</span>;
    case "if-permitted":
      return <span className={`${PILL} bg-caution-50 text-caution-700`}>If permitted</span>;
    default:
      return <Icon name="perm-off-18" size={18} alt="Not allowed" />;
  }
}
