import { Checkbox, Icon, type IconName } from "@/components/atoms";

// Figma "With check mark": checkbox, 16px icon and label in a clickable 36px row.
// Pass checked + onCheckedChange to control it, or defaultChecked to let it keep its own state.
export interface FilterOptionProps {
  icon: IconName;
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Greyed out and not clickable, e.g. a filter the backend can't do yet. */
  disabled?: boolean;
}

export function FilterOption({
  icon,
  label,
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
}: FilterOptionProps) {
  return (
    <label
      className={
        disabled
          ? "flex w-full cursor-not-allowed items-center gap-3 p-2 opacity-50"
          : "flex w-full cursor-pointer items-center gap-3 p-2"
      }
    >
      <Checkbox
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange?.(value)}
        disabled={disabled}
      />
      <span className="flex items-center gap-2 type-paragraph-sm text-grey-700">
        <Icon name={icon} size={16} />
        {label}
      </span>
    </label>
  );
}
