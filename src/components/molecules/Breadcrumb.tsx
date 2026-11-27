import Link from "next/link";
import { Fragment } from "react";

import { Icon } from "@/components/atoms";

// Breadcrumb above a detail page title (Figma "Breadcrumb" 60:13819): back chevron + parent link
// (Inter Medium 13/18 green-ink), a grey 14px chevron, then the current page (13/18 grey-700).
// `trail` adds more parent links after the first (Assign role 103:19437: All staff › Daniel
// Mensah › Assign role), each green-ink with a separator.
export interface BreadcrumbProps {
  parent: { label: string; href: string };
  trail?: { label: string; href: string }[];
  current: string;
}

export function Breadcrumb({ parent, trail = [], current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 pb-1 type-ui-13 font-medium">
      <Link href={parent.href} className="flex items-center gap-1.5 text-green-ink hover:underline">
        <Icon name="back-green-16" size={16} />
        {parent.label}
      </Link>
      <Icon name="breadcrumb-sep-14" size={14} />
      {trail.map((link) => (
        <Fragment key={link.href}>
          <Link href={link.href} className="text-green-ink hover:underline">
            {link.label}
          </Link>
          <Icon name="breadcrumb-sep-14" size={14} />
        </Fragment>
      ))}
      <span aria-current="page" className="truncate text-grey-700">
        {current}
      </span>
    </nav>
  );
}
