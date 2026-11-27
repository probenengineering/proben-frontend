// All staff (Figma 103:18355): the screen's view of a person, filters, sorts and tints. Live data
// comes from GET /api/identity/staff, mapped in lib/staff-api/mappers.ts.

export type StaffStatus = "active" | "pending" | "inactive";
export type StaffTint = "purple" | "green" | "amber" | "pink" | "grey" | "blue" | "teal";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  staffId: string;
  role: string;
  homes: string[];
  status: StaffStatus;
  /** ISO date. */
  addedAt: string;
  tint: StaffTint;
  /** Invited status but the invitation was never sent (created with sendInvite: false). */
  notInvited?: boolean;
  /** Has ever activated their account; reactivating returns them to Active, else to invited. */
  everActive?: boolean;
  /** Further roles after `role` (shown as "+1"). */
  otherRoles?: string[];
  /** Profile photo through our file proxy; initials are shown without one. */
  photoSrc?: string;
}

/** Initials avatar tints (All staff 103:18400; profile 103:18939). */
export const STAFF_TINT_CLASSES: Record<StaffTint, string> = {
  purple: "bg-staff-purple-50 text-staff-purple",
  green: "bg-staff-green-50 text-staff-green",
  amber: "bg-staff-amber-50 text-caution-600",
  pink: "bg-staff-pink-50 text-staff-pink",
  grey: "bg-slate-100 text-staff-grey",
  blue: "bg-info-50 text-staff-blue",
  teal: "bg-staff-teal-50 text-staff-teal",
};

export type StaffFilter = "none" | StaffStatus;
export type StaffSort = "name-asc" | "name-desc" | "added-desc" | "added-asc";

export const STAFF_PAGE_SIZE = 6;

export const STAFF_FILTERS: { id: StaffFilter; label: string }[] = [
  { id: "none", label: "None" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending invitation" },
  { id: "inactive", label: "Inactive" },
];

export const STAFF_SORTS: { id: StaffSort; label: string }[] = [
  { id: "name-asc", label: "Name (A–Z)" },
  { id: "name-desc", label: "Name (Z–A)" },
  { id: "added-desc", label: "Newest first" },
  { id: "added-asc", label: "Oldest first" },
];

export interface StaffCounts {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

/** "Mar 4, 2025". */
export function formatAddedDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
