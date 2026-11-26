import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// "Location check" box in the clock-in modal (Figma 60:10852): 12px radius, verified-50 fill,
// 20px verified icon, Inter Semi Bold 14/20 title and 13/18 detail in verified-700.
// Only "verified" is in Figma; "checking" (neutral) and "failed" (danger) reuse its layout.
export interface LocationCheckProps {
  state: "checking" | "verified" | "failed";
  title: string;
  detail?: string;
}

const tones = {
  checking: "bg-slate-50 text-slate-500",
  verified: "bg-verified-50 text-verified-700",
  failed: "bg-danger-50 text-danger-700",
};

export function LocationCheck({ state, title, detail }: LocationCheckProps) {
  return (
    <div
      role="status"
      className={cn("flex w-full items-center gap-2.5 rounded-[12px] px-3.5 py-3", tones[state])}
    >
      {state === "verified" && <Icon name="verified" size={20} />}
      {state === "failed" && <Icon name="close-circle" size={20} />}
      {state === "checking" && (
        <span
          aria-hidden
          className="size-5 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500"
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span className="type-ui-14 font-semibold">{title}</span>
        {detail && <span className="type-ui-13">{detail}</span>}
      </span>
    </div>
  );
}
