import "server-only";

import { connection } from "next/server";
import { cache } from "react";

import { ApiError, request, type RequestOptions } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";

import { addDays, dayKey, FALLBACK_TIMEZONE, startOfDay } from "./time";
import type {
  ApiHomeResource,
  ApiHomeUpdate,
  ApiEvent,
  ApiHome,
  ApiOverview,
  ApiShift,
  ApiTask,
  Page,
} from "./types";

// Command Center API calls with the signed-in person's token. Server-side only.

export async function commandCenter<T>(
  path: string,
  options: Omit<RequestOptions, "accessToken"> = {},
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new ApiError(401, "UNAUTHENTICATED", "Your session has ended. Sign in again.");
  }
  return request<T>(`/api/commandcenter${path}`, { ...options, accessToken });
}

/** Date.now() for request-time data; tells Next not to prerender past this point. */
export async function requestTime() {
  await connection();
  return Date.now();
}

export interface Range {
  from: number;
  to: number;
}

const range = ({ from, to }: Range) =>
  new URLSearchParams({ from: new Date(from).toISOString(), to: new Date(to).toISOString() });

export const getOverview = (r: Range) =>
  commandCenter<ApiOverview>(`/overview?${range(r)}&limit=50`);

export const listShifts = (r: Range) =>
  commandCenter<Page<ApiShift>>(`/shifts?${range(r)}&limit=100`);

/** `from`/`to` are required here even though Swagger marks them optional. */
export const listOpenShifts = (r: Range) =>
  commandCenter<Page<ApiShift>>(`/shifts/open?${range(r)}&limit=100`);

export const listEvents = (r: Range) =>
  commandCenter<Page<ApiEvent>>(`/events?${range(r)}&limit=100`);

export const listTasks = () => commandCenter<Page<ApiTask>>("/tasks?sort=due&limit=100");

/** Active and upcoming assigned homes, cached per request. */
export const listHomes = cache(() =>
  commandCenter<Page<ApiHome>>("/homes?assignment=all&limit=100"),
);

/** GET /overview for today (local midnight to midnight in `tz`), cached per request. */
export const getTodayOverview = cache(async () => {
  const tz = await getTimezone();
  const today = dayKey(await requestTime(), tz);
  const overview = await getOverview({
    from: startOfDay(today, tz),
    to: startOfDay(addDays(today, 1), tz),
  });
  return { overview, tz };
});

/** The zone to group "today" in: the first assigned home's with a zone, else the fallback. */
export const getTimezone = cache(async () => {
  const homes = await listHomes().catch(() => null);
  return homes?.items.find((h) => h.details?.timezone)?.details?.timezone ?? FALLBACK_TIMEZONE;
});

/** A home's visible staff directory. The response shape isn't documented yet (R39). */
export const getHomeTeam = (id: string) =>
  commandCenter<unknown>(`/homes/${encodeURIComponent(id)}/team`);

/** Shifts at a home in a range. The response shape isn't documented yet (R40). */
export const getHomeSchedule = (id: string, r: Range) =>
  commandCenter<unknown>(`/homes/${encodeURIComponent(id)}/schedule?${range(r)}&limit=100`);

export const listHomeUpdates = (id: string) =>
  commandCenter<Page<ApiHomeUpdate>>(`/homes/${encodeURIComponent(id)}/updates?limit=100`);

export const listHomeResources = (id: string) =>
  commandCenter<Page<ApiHomeResource>>(`/homes/${encodeURIComponent(id)}/resources?limit=100`);
