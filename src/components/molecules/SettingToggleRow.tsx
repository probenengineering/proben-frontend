import { Switch } from "@/components/atoms";

// A 53px row in the display-options menu: label on the left, switch on the right, divider below.
// Figma uses "Inter Display" Medium for the label; we use Inter Medium, as agreed.
// Pass checked + onCheckedChange to control it, or defaultChecked to let it keep its own state.
export interface SettingToggleRowProps {
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Greyed out and not clickable, e.g. an option the backend can't do yet. */
  disabled?: boolean;
}

export function SettingToggleRow({
  label,
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
}: SettingToggleRowProps) {
  return (
    <label
      className={
        disabled
          ? "flex w-full cursor-not-allowed items-center justify-between border-b border-white-400 px-5 py-3.5 opacity-50"
          : "flex w-full cursor-pointer items-center justify-between border-b border-white-400 px-5 py-3.5"
      }
    >
      <span className="type-paragraph-sm font-medium text-grey-700">{label}</span>
      {/* Figma's toggle icon is 24px with the switch centred inside. */}
      <span className="flex size-6 items-center justify-center">
        <Switch
          defaultChecked={defaultChecked}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange?.(value)}
          disabled={disabled}
        />
      </span>
    </label>
  );
}
