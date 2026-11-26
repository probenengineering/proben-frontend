// Keyboard key chip (Figma "Key / ↵" in the search panel 60:15121): 20px, slate-100, slate-200
// border, 5px radius, 5px side padding, Inter Medium 11/14 slate-500.
export interface KeyHintProps {
  children: string;
}

export function KeyHint({ children }: KeyHintProps) {
  return (
    <kbd className="flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-slate-200 bg-slate-100 px-1.25 type-ui-11-14 font-inter font-medium text-slate-500">
      {children}
    </kbd>
  );
}
