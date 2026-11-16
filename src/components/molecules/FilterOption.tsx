import { Checkbox, Icon, type IconName } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Figma "With check mark": checkbox, 16px icon and label in a clickable 36px row.
// Pass checked + onCheckedChange to control it, or defaultChecked to let it keep its own state.
// Without an icon and with `medium`, it's the task status filter row (Figma 51:11193:
// Inter Display Medium 14px at −2%, built with Inter Medium as agreed).
export interface FilterOptionProps {
  icon?: IconName;
  medium?: boolean;
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
  medium,
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
      <span
        className={cn(
          "flex items-center gap-2 type-paragraph-sm text-grey-700",
          medium && "font-inter! font-medium tracking-[-0.02em]",
        )}
      >
        {icon && <Icon name={icon} size={16} />}
        {label}
      </span>
    </label>
  );
}
