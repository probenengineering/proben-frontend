import { Icon, type IconName } from "@/components/atoms";

// Large faded icon with a short message, e.g. "No messages selected".
export interface EmptyStateProps {
  icon: IconName;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Icon name={icon} size={80} />
      <p className="type-paragraph-sm whitespace-nowrap text-black/50">{message}</p>
    </div>
  );
}
