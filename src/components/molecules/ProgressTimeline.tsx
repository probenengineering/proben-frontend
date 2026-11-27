import { cn } from "@/lib/utils";

// Task progress (Figma "Section / Progress" 103:20313): rows 10px apart, each a 10px dot
// (verified-500 done, grey-300 not yet), the step (Inter Medium 13/18 slate-900, grey-400 when not
// done) and when (13/18 slate-500, "Not yet").
export interface ProgressTimelineProps {
  steps: { label: string; when?: string }[];
}

export function ProgressTimeline({ steps }: ProgressTimelineProps) {
  return (
    <ol className="flex flex-col gap-2.5">
      {steps.map((s) => (
        <li key={s.label} className="flex items-center gap-2.5 type-ui-13">
          <span
            aria-hidden
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              s.when ? "bg-verified-500" : "bg-grey-300",
            )}
          />
          <span className={cn("font-medium", s.when ? "text-slate-900" : "text-grey-400")}>
            {s.label}
          </span>
          <span className="text-slate-500">{s.when ?? "Not yet"}</span>
        </li>
      ))}
    </ol>
  );
}
