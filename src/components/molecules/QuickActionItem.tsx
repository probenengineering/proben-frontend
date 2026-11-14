import Link from "next/link";

import { Icon, type IconName } from "@/components/atoms";

// Quick Access row: 16px icon + Inter Tight Medium 16px label. Pill-shaped hit area.
export interface QuickActionItemProps {
  icon: IconName;
  label: string;
  href?: string;
}

export function QuickActionItem({ icon, label, href = "#" }: QuickActionItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-[32px] p-2 type-title-md font-medium whitespace-nowrap text-black"
    >
      <Icon name={icon} size={16} />
      {label}
    </Link>
  );
}
