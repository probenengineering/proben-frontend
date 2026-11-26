import { KeyHint } from "@/components/atoms";

// Search panel footer (Figma "Footer" 60:15095): slate-50, slate-200 top border, 16 × 10 padding,
// 14px gaps; key hints (↑ ↓ Navigate, ↵ Open, tab Switch scope, esc Close; 12/16 slate-500) and on
// the right a note (12/16 grey-400: "Searches all of Proben", "6 results", "Searching…").
export interface SearchFooterProps {
  note: string;
}

const HINTS: [string[], string][] = [
  [["↑", "↓"], "Navigate"],
  [["↵"], "Open"],
  [["tab"], "Switch scope"],
  [["esc"], "Close"],
];

export function SearchFooter({ note }: SearchFooterProps) {
  return (
    <div className="hidden items-center gap-3.5 border-t border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
      {HINTS.map(([keys, label]) => (
        <span key={label} className="flex items-center gap-1 type-ui-12-16 text-slate-500">
          {keys.map((k) => (
            <KeyHint key={k}>{k}</KeyHint>
          ))}
          {label}
        </span>
      ))}
      <span className="ml-auto type-ui-12-16 text-grey-400">{note}</span>
    </div>
  );
}
