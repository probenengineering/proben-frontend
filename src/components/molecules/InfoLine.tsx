import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/atoms";

// 16px icon + Inter 14px grey-700 text, with an optional "+2 more" in Inter Tight.
export interface InfoLineProps {
  icon: IconName;
  text: ReactNode;
  extra?: string;
}

export function InfoLine({ icon, text, extra }: InfoLineProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-grey-700">
      <Icon name={icon} size={16} />
      <span className="truncate type-paragraph-sm font-inter!">{text}</span>
      {extra && <span className="shrink-0 type-title-sm font-medium">{extra}</span>}
    </div>
  );
}
