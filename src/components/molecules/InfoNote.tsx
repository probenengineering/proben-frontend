import { Icon } from "@/components/atoms";

// Grey note inside a form card (Figma "Account note" 103:18715): slate-50, 10px radius, 10px left /
// 12px right / 8px vertical padding, 8px gap; 16px grey info icon and Inter 12/17 slate-500.
export interface InfoNoteProps {
  children: string;
}

export function InfoNote({ children }: InfoNoteProps) {
  return (
    <p className="flex w-full items-center gap-2 rounded-[10px] bg-slate-50 py-2 pr-3 pl-2.5 type-ui-12-17 text-slate-500">
      <Icon name="info-grey-16" size={16} />
      <span className="min-w-0 flex-1">{children}</span>
    </p>
  );
}
