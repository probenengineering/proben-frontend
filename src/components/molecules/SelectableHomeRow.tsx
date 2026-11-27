"use client";

import { Checkbox, Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// A home that can be added (Figma "Home Select Row", Default 103:18087 / Selected 103:18094):
// 18px checkbox (5px radius), 12px gaps, 14 × 12 padding, 12px radius. White with a slate-200
// border; selected: green-500/7 fill and a green-500 border. Tile and text as AssignedHomeRow.
export interface SelectableHomeRowProps {
  name: string;
  detail: string;
  selected: boolean;
  onToggle: () => void;
}

export function SelectableHomeRow({ name, detail, selected, onToggle }: SelectableHomeRowProps) {
  return (
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-[12px] border px-3.5 py-3 transition-colors",
        selected
          ? "border-green-500 bg-green-500/7"
          : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <Checkbox size="form" checked={selected} onCheckedChange={onToggle} aria-label={name} />
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-green-500/12">
        <Icon name="home-tile-18" size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-ui-14 font-semibold text-slate-900">{name}</span>
        <span className="truncate type-ui-12-17 text-slate-500">{detail}</span>
      </span>
    </label>
  );
}
