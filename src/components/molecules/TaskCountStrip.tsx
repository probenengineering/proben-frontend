import { cn } from "@/lib/utils";

// Task counts on the staff profile (Figma "Task stats" 103:18963): slate-50, 12px radius, six
// equal cells (14 × 12 padding, 2px gap): value Inter Semi Bold 18/26 slate-900 (caution-700 for
// "Needs attention"), label 12/17 slate-500. Phones: 3 × 2.
export interface TaskCountStripProps {
  counts: { label: string; value: number; attention?: boolean }[];
}

export function TaskCountStrip({ counts }: TaskCountStripProps) {
  return (
    <dl className="grid w-full grid-cols-3 rounded-[12px] bg-slate-50 md:grid-cols-6">
      {counts.map((c) => (
        <div key={c.label} className="flex min-w-0 flex-col-reverse gap-0.5 px-3.5 py-3">
          <dt className="type-ui-12-17 whitespace-nowrap text-slate-500">{c.label}</dt>
          <dd
            className={cn(
              "type-ui-18-26 font-semibold",
              c.attention && c.value > 0 ? "text-caution-700" : "text-slate-900",
            )}
          >
            {c.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
