import { cn } from "@/lib/utils";

// Full-width row at the foot of the My tasks table: "Show 13 completed tasks" (slate-50, Figma
// "Show completed" 60:11349) or "Show 7 more" (white, Figma "Load more" 60:11278). 42px, Inter
// Semi Bold 13/18 grey-700, slate-200 top border.
export interface TableFooterButtonProps {
  label: string;
  onClick: () => void;
  tone?: "muted" | "plain";
}

export function TableFooterButton({ label, onClick, tone = "plain" }: TableFooterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full border-t border-slate-200 py-3 type-ui-13 font-semibold text-grey-700 hover:bg-slate-100",
        tone === "muted" ? "bg-slate-50" : "bg-white",
      )}
    >
      {label}
    </button>
  );
}
