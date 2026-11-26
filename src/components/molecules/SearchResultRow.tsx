import { Icon, type IconName, KeyHint } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { SearchItem, SearchTone } from "@/types/search";

// A row in the search panel (Figma "Result / …" 60:15121): 10px radius, 10 × 8 padding, 12px
// gaps; green-tint when active (hover or arrow keys). 34px tile (10px radius) with initials
// (Semi Bold 12/16) or an 18px icon on the tone at 12%; title Inter Medium 14/20 slate-900 with the
// match in Bold green-ink; detail 12/18 slate-500; meta 12/16 grey-400; the active row adds
// "Open ↵" (Medium 12/16 green-ink).
const TONES: Record<SearchTone, { tile: string; text: string }> = {
  grey: { tile: "bg-grey-400/12", text: "text-grey-700" },
  green: { tile: "bg-green-500/12", text: "text-green-ink" },
  amber: { tile: "bg-caution-500/12", text: "text-caution-700" },
  blue: { tile: "bg-info-500/12", text: "text-info-700" },
  sky: { tile: "bg-event-blue/12", text: "text-event-blue-text" },
  purple: { tile: "bg-event-purple/12", text: "text-event-purple-text" },
  emerald: { tile: "bg-avatar-emerald/12", text: "text-verified-700" },
};

const ICONS: Record<NonNullable<SearchItem["icon"]>, IconName> = {
  home: "search-home-18",
  schedule: "search-schedule-18",
  message: "search-message-18",
  tasks: "search-tasks-18",
  recent: "search-recent-18",
};

/** Bold green-ink on the first case-insensitive match of `query` in `text`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-bold text-green-ink">{text.slice(i, i + query.length)}</strong>
      {text.slice(i + query.length)}
    </>
  );
}

export interface SearchResultRowProps {
  title: string;
  detail?: string;
  meta?: string;
  tone: SearchTone;
  initials?: string;
  icon?: SearchItem["icon"] | IconName;
  query?: string;
  active?: boolean;
  /** "⌥ C" for quick actions. */
  shortcut?: string;
  onSelect: () => void;
  onHover: () => void;
  id: string;
}

export function SearchResultRow({
  title,
  detail,
  meta,
  tone,
  initials,
  icon,
  query = "",
  active,
  shortcut,
  onSelect,
  onHover,
  id,
}: SearchResultRowProps) {
  const t = TONES[tone];
  const iconName = icon && (icon in ICONS ? ICONS[icon as keyof typeof ICONS] : (icon as IconName));
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseMove={onHover}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-2",
        active && "bg-green-tint",
      )}
    >
      <span
        className={cn("flex size-8.5 shrink-0 items-center justify-center rounded-[10px]", t.tile)}
      >
        {initials ? (
          <span className={cn("type-ui-12-16 font-semibold", t.text)}>{initials}</span>
        ) : (
          iconName && <Icon name={iconName} size={18} />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate type-ui-14 font-medium text-slate-900">
          <Highlight text={title} query={query} />
        </span>
        {detail && <span className="truncate type-ui-12 text-slate-500">{detail}</span>}
      </span>
      {meta && <span className="shrink-0 type-ui-12-16 text-grey-400">{meta}</span>}
      {shortcut && !active && (
        <span className="hidden shrink-0 type-ui-12-16 text-grey-400 sm:inline">{shortcut}</span>
      )}
      {active && (
        <span className="hidden shrink-0 items-center gap-1 sm:flex">
          <span className="type-ui-12-16 font-medium text-green-ink">Open</span>
          <KeyHint>↵</KeyHint>
        </span>
      )}
    </li>
  );
}
