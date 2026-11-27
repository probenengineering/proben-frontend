import Link from "next/link";

import { cn } from "@/lib/utils";

// Underline tabs on the home detail page (Figma "Detail tabs" 60:13839): slate-200 bottom
// border, 24px gaps; each tab 4px top / 10px bottom padding, Inter 14/20. Selected: Semi Bold
// slate-900 with a 2px green-500 underline; others Medium slate-500. Tabs with an href are links;
// tabs without a design yet are shown but disabled.
export interface DetailTabsProps {
  tabs: { id: string; label: string; disabled?: boolean; href?: string }[];
  selected: string;
}

export function DetailTabs({ tabs, selected }: DetailTabsProps) {
  return (
    <div
      role="tablist"
      // Phones: the row scrolls sideways; the faded right edge shows there are more tabs.
      className="flex [scrollbar-width:none] gap-6 overflow-x-auto overflow-y-hidden border-b border-slate-200 max-sm:[mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)] max-sm:pr-6 [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((t) => {
        const on = t.id === selected;
        const className = cn(
          "-mb-px shrink-0 border-b-2 pt-1 pb-2.5 type-ui-14 whitespace-nowrap",
          on
            ? "border-green-500 font-semibold text-slate-900"
            : "border-transparent font-medium text-slate-500 hover:text-slate-900 disabled:cursor-default disabled:hover:text-slate-500",
        );
        return t.href && !t.disabled ? (
          <Link
            key={t.id}
            href={t.href}
            role="tab"
            aria-selected={on}
            scroll={false}
            className={className}
          >
            {t.label}
          </Link>
        ) : (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            disabled={t.disabled && !on}
            className={className}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
