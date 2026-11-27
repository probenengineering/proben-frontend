import "server-only";

import { connection } from "next/server";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { sessionEnded } from "@/lib/auth/session";
import type { Coverage, HomeAssignment } from "@/lib/home-assignments";

import { listHomeStaffing } from "./api";
import { fileSrc, tintFor } from "./mappers";
import type { ApiCoverage, ApiHomeStaffing } from "./types";

// Home assignments (Figma 103:20849) from GET /api/identity/homes/assignments: every home in the
// caller's staff.view scope with its active staff, home manager and coverage. Read-only.

const COVERAGE: Record<ApiCoverage, Coverage> = {
  covered: "covered",
  no_manager: "no-manager",
  one_staff: "one-staff",
};

/**
 * The page loads every home (search and the coverage filter run in the browser), 100 at a time:
 * the endpoint rejects a larger limit (400 VALIDATION_FAILED at 200). At most 10 pages.
 */
const LIMIT = 100;
const MAX_PAGES = 10;

export interface HomeStaffing {
  homes: HomeAssignment[];
  /** Homes and distinct active staff in scope, before filters. */
  totals: { homes: number; staff: number };
  error?: string;
}

/** `avatarUrl` is an authenticated content path ("/api/files/<id>/content"): use our proxy. */
const photoOf = (avatarUrl?: string | null) =>
  fileSrc(avatarUrl?.match(/files\/([0-9a-f-]{36})/i)?.[1]);

/** "Madison, WI"; one value when both are the same ("Lagos"). */
const place = (city?: string | null, state?: string | null) =>
  [...new Set([city, state].filter((v): v is string => !!v?.trim()))].join(", ");

function toHome(home: ApiHomeStaffing): HomeAssignment {
  const managers = home.managers ?? [];
  const manager = home.manager?.displayName ?? managers[0]?.displayName;
  return {
    id: home.id,
    name: home.name ?? "Unnamed home",
    code: home.code ?? "",
    city: place(home.city, home.state),
    address: home.address ?? undefined,
    staff: (home.staff ?? []).map((p) => ({
      id: p.id,
      name: p.displayName ?? "Staff member",
      tint: tintFor(p.id ?? p.displayName ?? ""),
      photoSrc: photoOf(p.avatarUrl),
    })),
    staffCount: home.staffCount ?? home.staff?.length ?? 0,
    // Several home managers: the first, then "+1".
    manager: manager && (managers.length > 1 ? `${manager} +${managers.length - 1}` : manager),
    coverage: COVERAGE[home.coverage ?? "no_manager"] ?? "no-manager",
  };
}

export async function getHomeStaffing(): Promise<HomeStaffing> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  try {
    const first = await listHomeStaffing({ limit: LIMIT });
    const items = [...first.items];
    for (let page = 1; page < MAX_PAGES && items.length < first.total; page++) {
      const next = await listHomeStaffing({ limit: LIMIT, offset: page * LIMIT });
      if (next.items.length === 0) break;
      items.push(...next.items);
    }
    return {
      homes: items.map(toHome).sort((a, b) => a.name.localeCompare(b.name)),
      totals: first.totals ?? { homes: first.total, staff: 0 },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) sessionEnded(error);
    return { homes: [], totals: { homes: 0, staff: 0 }, error: errorMessage(error) };
  }
}
