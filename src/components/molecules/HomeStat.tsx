import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/atoms";

// A number on a home card (Figma 51:12625): 20px icon and value (Inter Medium 14, grey-900),
// grey-700 label underneath, e.g. "12 / Residents".
export interface HomeStatProps {
  icon: IconName;
  value: ReactNode;
  label: string;
}

export function HomeStat({ icon, value, label }: HomeStatProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 py-2 type-paragraph-sm">
      <div className="flex items-center gap-2">
        <Icon name={icon} />
        <span className="min-w-0 flex-1 font-medium text-grey-900">{value}</span>
      </div>
      <span className="text-grey-700">{label}</span>
    </div>
  );
}
