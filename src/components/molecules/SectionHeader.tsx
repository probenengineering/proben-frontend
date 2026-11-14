import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/atoms";

import { ArrowLink } from "./ArrowLink";

// Section title: 16px icon, label, optional grey subtitle and pill, then a link or a pill on the
// right. size "sm" = Inter Medium 14px (dashboard); "md" = Inter Tight Medium 16px (task days).
export interface SectionHeaderProps {
  icon: IconName;
  title: string;
  /** Grey text after the title, e.g. "Tue, Oct 28, 2026". */
  subtitle?: string;
  size?: "sm" | "md";
  /** e.g. a StatusPill such as "3 available", next to the title. */
  badge?: ReactNode;
  /** Content pushed to the right instead of a link, e.g. a StatusPill. */
  trailing?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  size = "sm",
  badge,
  trailing,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <Icon name={icon} size={16} />
        <h2
          className={
            size === "md"
              ? "type-title-md font-medium whitespace-nowrap text-black"
              : "type-paragraph-sm font-inter! font-medium whitespace-nowrap text-black"
          }
        >
          {title}
        </h2>
        {subtitle && (
          <span className="type-title-sm whitespace-nowrap text-black-50">{subtitle}</span>
        )}
        {badge}
      </div>
      {trailing}
      {actionLabel && <ArrowLink href={actionHref}>{actionLabel}</ArrowLink>}
    </div>
  );
}
