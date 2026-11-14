"use client";

import { Fragment, useState } from "react";

import { Avatar, type AvatarProps, Checkbox, Icon, Input } from "@/components/atoms";

// Contents of a filter dropdown: optional "Filter" search box, then rows with an avatar
// (teams, homes) or a checkbox (roles). One row is selected at a time; typing narrows the rows.
export interface FilterListItem {
  /** Sent back through onSelect; "" for the "All …" row. */
  id: string;
  label: string;
  avatar?: Pick<AvatarProps, "src" | "color" | "initials">;
  /** Draw a thin line above this row. */
  separatorBefore?: boolean;
}

export interface FilterOptionListProps {
  items: FilterListItem[];
  search?: boolean;
  /** Rows start with a checkbox instead of an avatar. */
  checkboxes?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Shown when no rows match, e.g. "No teams". */
  emptyLabel?: string;
}

export function FilterOptionList({
  items,
  search,
  checkboxes,
  selectedId = "",
  onSelect,
  emptyLabel = "No matches",
}: FilterOptionListProps) {
  const [term, setTerm] = useState("");
  const shown = items.filter((item) =>
    item.label.toLowerCase().includes(term.trim().toLowerCase()),
  );
  return (
    <>
      {search && (
        <Input
          aria-label="Filter"
          placeholder="Filter"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          iconLeft={<Icon name="search" size={16} />}
          frameClassName="h-auto gap-2.5 rounded-[12px] border-white-400 py-3 pr-3 pl-4 type-title-sm"
          className="placeholder:text-black"
        />
      )}
      <div role="listbox" className="flex max-h-72 flex-col gap-1 overflow-y-auto px-2">
        {shown.length === 0 && <p className="py-2 type-paragraph-sm text-grey-500">{emptyLabel}</p>}
        {shown.map((item) => {
          const selected = item.id === selectedId;
          return (
            <Fragment key={item.id || item.label}>
              {item.separatorBefore && <div className="h-px w-full bg-white-50" />}
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect?.(item.id)}
                className={
                  checkboxes
                    ? "flex w-55.25 cursor-pointer items-center gap-1 py-2 text-left type-paragraph-sm font-medium text-grey-900"
                    : "flex w-55.25 cursor-pointer items-center gap-3 py-2 text-left"
                }
              >
                {checkboxes ? (
                  <Checkbox checked={selected} tabIndex={-1} className="pointer-events-none" />
                ) : (
                  <Avatar size="sm" {...item.avatar} />
                )}
                <span
                  className={
                    checkboxes ? undefined : "flex-1 type-paragraph-sm font-medium text-grey-900"
                  }
                >
                  {item.label}
                </span>
                {!checkboxes && selected && <Icon name="check" size={16} />}
              </button>
            </Fragment>
          );
        })}
      </div>
    </>
  );
}
