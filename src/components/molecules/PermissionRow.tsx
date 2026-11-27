import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma "Permission Item" (103:19467): 18px indicator (green tick in a green-50 circle, or a grey
// ✕ in slate-100), 10px gap, Inter 14/20: grey-700 when granted, grey-400 when not.
export interface PermissionRowProps {
  label: string;
  granted: boolean;
}

export function PermissionRow({ label, granted }: PermissionRowProps) {
  return (
    <li className="flex items-center gap-2.5">
      <Icon name={granted ? "perm-on-18" : "perm-off-18"} size={18} />
      <span className={cn("type-ui-14", granted ? "text-grey-700" : "text-grey-400")}>
        {label}
        <span className="sr-only">{granted ? " (included)" : " (not included)"}</span>
      </span>
    </li>
  );
}
