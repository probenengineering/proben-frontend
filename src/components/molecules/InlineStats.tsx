import { Icon, type IconName } from "@/components/atoms";

// Summary line above a table (Figma "Inline stats" 103:18373 / 103:20181): 16px icons, the number
// in Inter Semi Bold 14 slate-900 and the label in Inter 14 slate-500, 6px gaps, 24px between
// stats. A value of undefined (loading) shows "—".
export interface InlineStatsProps {
  stats: { icon: IconName; value?: number; label: string }[];
}

export function InlineStats({ stats }: InlineStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {stats.map((s) => (
        <span key={s.label} className="flex items-center gap-1.5 type-ui-14">
          <Icon name={s.icon} size={16} />
          <span className="font-semibold text-slate-900">{s.value ?? "—"}</span>
          <span className="text-slate-500">{s.label}</span>
        </span>
      ))}
    </div>
  );
}
