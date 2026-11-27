import { Icon } from "@/components/atoms";
import type { ProfileActivity } from "@/lib/staff-profile";

// One change on the staff profile's Activity tab (Figma "Activity Item" 103:19089): 12px
// vertical padding, 12px gap, slate-200 divider (none on the last). 32px slate-100 circle with a
// 16px icon; title Inter Medium 14/20 slate-900 over "who · when" (12/17 slate-500).
export interface ActivityItemProps {
  item: ProfileActivity;
}

export function ActivityItem({ item }: ActivityItemProps) {
  return (
    <li className="flex w-full items-start gap-3 border-b border-slate-200 py-3 last:border-b-0">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <Icon name={item.icon} size={16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-ui-14 font-medium text-slate-900">{item.title}</span>
        <span className="type-ui-12-17 text-slate-500">{item.meta}</span>
      </span>
    </li>
  );
}
