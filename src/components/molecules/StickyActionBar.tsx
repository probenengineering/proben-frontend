import type { ReactNode } from "react";

// Form footer pinned to the card's bottom (Figma "Sticky action bar" 103:18718): white,
// slate-200 top border, 40 × 16 padding (20px on phones), 10px gaps. The note (Inter 13/18
// slate-500) on the left, the buttons on the right; on phones the buttons wrap under the note.
export interface StickyActionBarProps {
  note: string;
  children: ReactNode;
}

export function StickyActionBar({ note, children }: StickyActionBarProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-t border-slate-200 bg-white px-5 py-4 lg:px-10">
      <p className="w-full type-ui-13 text-slate-500 sm:w-auto sm:flex-1">{note}</p>
      <div className="flex flex-wrap items-center justify-end gap-2.5 max-sm:w-full">
        {children}
      </div>
    </div>
  );
}
