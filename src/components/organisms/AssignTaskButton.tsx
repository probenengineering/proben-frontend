import Link from "next/link";

import { Button, Icon } from "@/components/atoms";

// Green "Assign task" pill in the Staff tasks header (Figma "Button" 103:20178): 18 × 11 padding,
// 8px gap, 18px white task icon, Inter Semi Bold 14/20 white. Opens the Assign task form.
export interface AssignTaskButtonProps {
  /** Pre-fills Assign to, e.g. "s2". */
  staffId?: string;
}

export function AssignTaskButton({ staffId }: AssignTaskButtonProps) {
  const href = staffId ? `/staff/tasks/new?staff=${staffId}` : "/staff/tasks/new";
  return (
    <Button
      variant="green"
      size="pill-lg"
      className="gap-2"
      render={<Link href={href} />}
      nativeButton={false}
    >
      <Icon name="task-all-white-18" size={18} />
      Assign task
    </Button>
  );
}
