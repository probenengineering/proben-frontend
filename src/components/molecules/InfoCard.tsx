// Card of labelled values on the home detail page (Figma "General information" 60:13852):
// white, slate-200 border, 14px radius. Title Inter Semi Bold 15/22 slate-900 (16 × 14 / 10
// padding), then a 3-column grid (12px row gap, 16 × 14 padding): label 12/18 slate-500 over the
// value Inter Medium 14/20 slate-900. Missing values show "—".
export interface InfoCardProps {
  title: string;
  fields: { label: string; value?: string }[];
}

export function InfoCard({ title, fields }: InfoCardProps) {
  return (
    <section className="flex flex-col rounded-[14px] border border-slate-200 bg-white">
      <h2 className="px-4 pt-3.5 pb-2.5 type-ui-15 font-semibold text-slate-900">{title}</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 pb-3.5 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="type-ui-12 text-slate-500">{f.label}</dt>
            <dd className="truncate type-ui-14 font-medium text-slate-900">{f.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
