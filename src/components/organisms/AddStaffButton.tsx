import Link from "next/link";

import { Button, Icon, type IconName } from "@/components/atoms";

// Green "Add staff" pill (Figma "Button" 103:18361): 18 × 11 padding, 8px gap, 18px user-add
// icon, Inter Semi Bold 14/20 white. Opens the Add staff form (/staff/new).
export interface AddStaffButtonProps {
  /** The empty state's copy uses Figma's dark-stroked icon (103:18499). */
  icon?: Extract<IconName, "user-add-white-18" | "user-add-empty-18">;
}

export function AddStaffButton({ icon = "user-add-white-18" }: AddStaffButtonProps) {
  return (
    <Button
      variant="green"
      size="pill-lg"
      className="gap-2"
      render={<Link href="/staff/new" />}
      nativeButton={false}
    >
      <Icon name={icon} size={18} />
      Add staff
    </Button>
  );
}
