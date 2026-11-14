import { Icon, type IconName } from "@/components/atoms";

// Shift address: 16px icon (location, or video for remote) + grey Inter Tight Medium 14px.
export interface AddressLineProps {
  icon?: IconName;
  address: string;
}

export function AddressLine({ icon = "location", address }: AddressLineProps) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <Icon name={icon} size={16} />
      <span className="min-w-0 flex-1 type-title-sm font-medium text-black-50">{address}</span>
    </div>
  );
}
