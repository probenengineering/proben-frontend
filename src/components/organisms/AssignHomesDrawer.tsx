"use client";

import { useState } from "react";

import { Button, Icon, InitialsAvatar, RoleTag } from "@/components/atoms";
import {
  AssignedHomeRow,
  FilterSelect,
  PillSearch,
  SelectableHomeRow,
} from "@/components/molecules";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui";
import { SheetDescription } from "@/components/ui/sheet";
import { useAssignHomes } from "@/hooks/useAssignHomes";
import { STAFF_TINT_CLASSES, type StaffMember } from "@/lib/staff";
import type { HomeOption, ProfileHome } from "@/lib/staff-profile";

import { ReviewHomeChangesDialog } from "./ReviewHomeChangesDialog";

// Assign homes drawer (Figma 103:19806): 560px, 24px radius, 10px from the edges, side-drawer
// shadow, slate-900/40 scrim; full width on phones. Body (28px sides, 24px top, 18px gaps): title Semi Bold 20/28 with
// a 38px ✕; the person (32px avatar, Semi Bold 14/20 name, role tag); the intro (14/20 slate-500);
// Assigned homes (Semi Bold 14/20 + count in slate-500, rows 8px apart, Remove / Undo); Available
// homes with "N selected" (Medium 13/18 green-ink), search + City, and tickable rows. Footer
// (slate-200 top border, 16 / 20 padding): "1 added · 1 removed" (Medium 13/18 grey-700), Cancel
// and Review changes (disabled until something changes, or while saving) → the review dialog.
// Available homes are the organisation's active homes (GET /api/identity/homes); rows are keyed by
// home id.
export interface AssignHomesDrawerProps {
  open: boolean;
  staff: StaffMember;
  homes: ProfileHome[];
  /** Homes that can be added (already-assigned ones are left out). */
  /** Null: the organisation's homes couldn't load (shown with a retry). */
  options: HomeOption[] | null;
  onRetry?: () => void;
  /** While the change is saving. */
  saving?: boolean;
  /** Home ids to mark for removal on open (a row's Remove on the profile). */
  initialRemoved?: string[];
  onClose: () => void;
  /** Home ids added and removed. */
  onConfirm: (change: { added: string[]; removed: string[] }) => void;
}

function Heading({ title, count, extra }: { title: string; count: number; extra?: string }) {
  return (
    <div className="flex items-center gap-1.5 type-ui-14">
      <span className="font-semibold text-slate-900">{title}</span>
      <span className="text-slate-500">{count}</span>
      <span className="flex-1" />
      {extra && <span className="type-ui-13 font-medium text-green-ink">{extra}</span>}
    </div>
  );
}

function DrawerBody({
  staff,
  homes,
  options,
  saving,
  initialRemoved,
  onClose,
  onConfirm,
  onRetry,
}: Omit<AssignHomesDrawerProps, "open">) {
  const s = useAssignHomes(homes, options ?? [], initialRemoved);
  const [reviewing, setReviewing] = useState(false);
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4.5 overflow-y-auto px-7 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <SheetTitle className="flex-1 type-ui-20 font-semibold text-slate-900">
            Assign homes
          </SheetTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9.5 items-center justify-center rounded-full border border-grey-300 bg-white hover:bg-slate-50"
          >
            <Icon name="close-circle-20" />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <InitialsAvatar
            name={staff.name}
            size={32}
            tintClassName={STAFF_TINT_CLASSES[staff.tint]}
            photoSrc={staff.photoSrc}
          />
          <span className="type-ui-14 font-semibold text-slate-900">{staff.name}</span>
          <RoleTag>{staff.role}</RoleTag>
        </div>
        <SheetDescription className="type-ui-14 text-slate-500">
          Select the group homes this staff member should be assigned to.
        </SheetDescription>
        <section className="flex flex-col gap-2">
          <Heading title="Assigned homes" count={homes.length} />
          {homes.length === 0 && <p className="type-ui-13 text-grey-400">No homes assigned yet.</p>}
          {homes.map((home) => (
            <AssignedHomeRow
              key={home.id}
              home={home}
              removing={s.removed.includes(home.id)}
              onRemove={() => s.toggleRemoved(home.id)}
              onUndo={() => s.toggleRemoved(home.id)}
            />
          ))}
        </section>
        <section className="flex flex-col gap-2">
          <Heading
            title="Available homes"
            count={s.availableCount}
            extra={s.added.length ? `${s.added.length} selected` : undefined}
          />
          <div className="flex items-center gap-2">
            <PillSearch
              value={s.query}
              onChange={s.setQuery}
              placeholder="Search by home name or address"
              className="min-w-0 flex-1"
            />
            <FilterSelect
              label="Filter by city"
              variant="status"
              showDot={false}
              fieldLabel="City"
              value={s.city}
              onChange={s.setCity}
              options={[{ id: "all", label: "All" }, ...s.cities.map((c) => ({ id: c, label: c }))]}
            />
          </div>
          {s.shown.map((home) => (
            <SelectableHomeRow
              key={home.id}
              name={home.name}
              detail={home.detail}
              selected={s.added.includes(home.id)}
              onToggle={() => s.toggleAdded(home.id)}
            />
          ))}
          {options === null ? (
            <p className="flex flex-wrap items-center gap-x-2 py-2 type-ui-13 text-slate-500">
              We couldn’t load the homes you can add.
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="font-medium text-green-link underline-offset-2 hover:underline"
                >
                  Try again
                </button>
              )}
            </p>
          ) : (
            s.shown.length === 0 && (
              <p className="py-2 type-ui-13 text-slate-500">
                {s.availableCount === 0 ? "No other homes to add." : "No homes match your search."}
              </p>
            )
          )}
        </section>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white px-7 pt-4 pb-5">
        <p className="flex-1 type-ui-13 font-medium whitespace-nowrap text-grey-700">
          {s.added.length} added · {s.removed.length} removed
        </p>
        <div className="flex gap-3 max-sm:w-full [&>*]:max-sm:flex-1">
          <Button variant="outline" size="pill-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="green"
            size="pill-lg"
            disabled={!s.changed || saving}
            onClick={() => setReviewing(true)}
          >
            Review changes
          </Button>
        </div>
      </div>
      <ReviewHomeChangesDialog
        open={reviewing}
        name={staff.name}
        role={staff.role}
        added={s.addedNames}
        kept={s.kept}
        removed={s.removedNames}
        pending={saving}
        onOpenChange={setReviewing}
        // Stays open (buttons disabled) while saving; the drawer closes once the change is saved.
        onConfirm={() => onConfirm({ added: s.added, removed: s.removed })}
      />
    </>
  );
}

export function AssignHomesDrawer({ open, ...props }: AssignHomesDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && props.onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="gap-0 rounded-[24px] border-0 bg-white p-0 shadow-side-drawer outline-none data-[side=right]:inset-y-2.5 data-[side=right]:right-2.5 data-[side=right]:h-auto data-[side=right]:w-140 data-[side=right]:max-w-[calc(100%-1.25rem)] data-[side=right]:border-l-0 data-[side=right]:sm:max-w-140"
      >
        {open && <DrawerBody {...props} />}
      </SheetContent>
    </Sheet>
  );
}
