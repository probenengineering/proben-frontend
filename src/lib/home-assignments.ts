import type { StaffTint } from "./staff";

// Home assignments (Figma 103:20849): who works at each home and who manages it. Live data comes
// from GET /api/identity/homes/assignments (lib/staff-api/home-staffing.ts).

export interface AssignedPerson {
  /** Staff id (live data). */
  id?: string;
  name: string;
  tint: StaffTint;
  /** Profile photo through our file proxy. */
  photoSrc?: string;
}

export type Coverage = "covered" | "no-manager" | "one-staff";

export interface HomeAssignment {
  /** Home id (live data). */
  id?: string;
  name: string;
  code: string;
  /** "Madison, WI". */
  city: string;
  /** Street address, matched by search. */
  address?: string;
  staff: AssignedPerson[];
  /** Total active staff (the avatar stack may show fewer). */
  staffCount?: number;
  manager?: string;
  coverage: Coverage;
}

export const COVERAGE_LABELS: Record<Coverage, string> = {
  covered: "Covered",
  "no-manager": "No home manager",
  "one-staff": "1 staff only",
};
