"use client";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Pill search box (Figma "Search homes" 60:12874): 36px, grey-300 border, 14px left / 10px right,
// 8px gap, 16px icon, Inter 14/20. With text (60:12961): green-500 border, a 3px green-500/22
// glow and a clear ✕.
export interface PillSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function PillSearch({ value, onChange, placeholder, className }: PillSearchProps) {
  return (
    <label
      className={cn(
        "flex h-9 items-center gap-2 rounded-full border bg-white pr-2.5 pl-3.5",
        value ? "border-green-500 shadow-[0_0_0_3px_rgb(133_196_64/0.22)]" : "border-grey-300",
        className,
      )}
    >
      <Icon name="search" size={16} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent type-ui-14 text-slate-900 outline-none placeholder:text-grey-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")}>
          <Icon name="clear-16" size={16} />
        </button>
      )}
    </label>
  );
}
