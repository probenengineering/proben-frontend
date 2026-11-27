import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// A card on the staff profile (Figma "Card / Tasks" 103:18958): white, slate-200 border, 16px
// radius (no radius token yet), 20 × 18 padding, 12px gaps. Header: title (Inter Semi Bold 16/23
// slate-900), optional meta (13/18 slate-500), and on the right an action link (Semi Bold 13/18
// green-ink) or a note (13/18 slate-500).
export interface ProfileCardProps {
  title: string;
  meta?: string;
  /** Green link on the right, e.g. "Assign task". */
  action?: { label: string; onClick: () => void };
  /** Grey text on the right, e.g. "Administrative changes only". */
  note?: string;
  children: ReactNode;
  className?: string;
}

export function ProfileCard({ title, meta, action, note, children, className }: ProfileCardProps) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-3 rounded-[16px] border border-slate-200 bg-white px-5 py-4.5",
        className,
      )}
    >
      <header className="flex items-center gap-2">
        <h2 className="type-ui-16-23 font-semibold text-slate-900">{title}</h2>
        {meta && <span className="type-ui-13 text-slate-500">{meta}</span>}
        <span className="flex-1" />
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="type-ui-13 font-semibold text-green-ink hover:underline"
          >
            {action.label}
          </button>
        )}
        {note && <span className="type-ui-13 text-slate-500">{note}</span>}
      </header>
      {children}
    </section>
  );
}
