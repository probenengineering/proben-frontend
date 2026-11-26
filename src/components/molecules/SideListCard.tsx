import { cn } from "@/lib/utils";

// Small side card on the Home updates tab (Figma "Home contacts" 60:14358, "This week" 60:14372):
// white, slate-200 border, 14px radius, 16 × 14 padding. Title Inter Semi Bold 15/22. "stacked":
// label 12/18 slate-500 over value Medium 14/20 slate-900, 12px apart. "inline": label 13/18
// slate-500 and value Semi Bold 13/18 on one row, 8px apart.
export interface SideListCardProps {
  title: string;
  rows: { label: string; value: string }[];
  variant?: "stacked" | "inline";
}

export function SideListCard({ title, rows, variant = "stacked" }: SideListCardProps) {
  const inline = variant === "inline";
  return (
    <section
      className={cn(
        "flex flex-col rounded-[14px] border border-slate-200 bg-white px-4 py-3.5",
        inline ? "gap-2" : "gap-3",
      )}
    >
      <h2 className="type-ui-15 font-semibold text-slate-900">{title}</h2>
      <dl className={cn("flex flex-col", inline ? "gap-2" : "gap-3")}>
        {rows.map((r) =>
          inline ? (
            <div key={r.label} className="flex items-center justify-between type-ui-13">
              <dt className="text-slate-500">{r.label}</dt>
              <dd className="font-semibold text-slate-900">{r.value}</dd>
            </div>
          ) : (
            <div key={r.label} className="flex flex-col gap-0.5">
              <dt className="type-ui-12 text-slate-500">{r.label}</dt>
              <dd className="type-ui-14 font-medium text-slate-900">{r.value}</dd>
            </div>
          ),
        )}
      </dl>
    </section>
  );
}
