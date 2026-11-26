import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./Icon";

// Task source tag (Figma "Source Tag", My tasks 60:11012): 6px radius, 10% tint, 14px icon,
// Inter Medium 12/18 in the dark tone, 8 × 3 padding (6px before the icon), 6px gap.
// Sources are the API's `source` enum; anything else shows grey with its raw name.
const SOURCES: Record<string, { label: string; icon: IconName; box: string }> = {
  training_policies: {
    label: "Training & Policies",
    icon: "source-training",
    box: "bg-event-purple/10 text-event-purple-text",
  },
  hr: { label: "HR", icon: "source-hr", box: "bg-warning/10 text-event-amber-text" },
  documents: {
    label: "My Documents",
    icon: "source-documents",
    box: "bg-event-blue/10 text-event-blue-text",
  },
  organizational: {
    label: "Organizational",
    icon: "source-organizational",
    box: "bg-slate-500/10 text-grey-700",
  },
  announcements: {
    label: "Announcements",
    icon: "source-announcements",
    box: "bg-event-green/10 text-event-green-text",
  },
};

export interface SourceTagProps {
  /** API `source`, e.g. "training_policies". */
  source: string;
  className?: string;
}

export function SourceTag({ source, className }: SourceTagProps) {
  const known = SOURCES[source];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-[6px] py-[3px] pr-2 pl-1.5 type-ui-12 font-medium whitespace-nowrap",
        known?.box ?? "bg-slate-500/10 text-grey-700",
        className,
      )}
    >
      {known && <Icon name={known.icon} size={14} />}
      {known?.label ?? source.replace(/_/g, " ")}
    </span>
  );
}

/** "Training & Policies" for "training_policies"; unknown sources keep their raw name. */
export const sourceLabel = (source: string) => SOURCES[source]?.label ?? source.replace(/_/g, " ");
