// "31 October 2026" with a thin line either side, between days in a conversation.
export interface DateDividerProps {
  label: string;
}

export function DateDivider({ label }: DateDividerProps) {
  return (
    <div className="flex w-full items-center gap-3.25">
      <span className="h-px flex-1 bg-black-10" />
      <p className="type-paragraph-sm font-medium whitespace-nowrap text-black-60">{label}</p>
      <span className="h-px flex-1 bg-black-10" />
    </div>
  );
}
