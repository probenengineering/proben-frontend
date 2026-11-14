// Figma "Message alert": teal pill (31x24) with the unread count.
export interface CountBadgeProps {
  count: number;
}

export function CountBadge({ count }: CountBadgeProps) {
  return (
    <span className="flex h-6 w-7.75 items-center justify-center rounded-[20px] bg-unread type-paragraph-sm text-white">
      {count}
    </span>
  );
}
