import { Checkbox } from "@/components/atoms";

// "Needs Attention" task: 14px checkbox + Inter Tight Medium 16px label.
export interface TaskItemProps {
  label: string;
}

export function TaskItem({ label }: TaskItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-[32px] p-2 type-title-md font-medium text-black">
      <Checkbox size="sm" />
      {label}
    </label>
  );
}
