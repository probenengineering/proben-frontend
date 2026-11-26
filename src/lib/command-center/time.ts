// Date helpers for Command Center data. The API groups calendars in the home's timezone, so
// everything here takes an IANA zone instead of relying on the server's or browser's zone.

/** Used when a record has no home timezone. */
export const FALLBACK_TIMEZONE = "Africa/Lagos";

const parts = (instant: number, timeZone: string) => {
  const map: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant)) {
    map[p.type] = p.value;
  }
  return map;
};

/** "2026-11-20" in the zone. */
export function dayKey(instant: number | string, timeZone: string) {
  const p = parts(new Date(instant).getTime(), timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Local wall-clock "2026-11-20T08:00" in the zone. */
export function localDateTime(instant: number | string, timeZone: string) {
  const p = parts(new Date(instant).getTime(), timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Hours since local midnight, e.g. 9.5 for 9:30. */
export function hourOfDay(instant: number | string, timeZone: string) {
  const p = parts(new Date(instant).getTime(), timeZone);
  return Number(p.hour) + Number(p.minute) / 60;
}

/** The UTC instant of local midnight starting `key` ("2026-11-20") in the zone. */
export function startOfDay(key: string, timeZone: string) {
  const guess = Date.parse(`${key}T00:00:00Z`);
  // Offset of the zone at that moment (positive east of UTC), applied twice for DST edges.
  const offset = (at: number) => {
    const p = parts(at, timeZone);
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - at;
  };
  const first = guess - offset(guess);
  return guess - offset(first);
}

/** Adds whole days to a "2026-11-20" key. */
export function addDays(key: string, days: number) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** "8:00 AM" in the zone. */
export function formatTime(instant: number | string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(instant));
}

/** Any Intl date format of a "2026-11-20" key (read as a calendar date, not an instant). */
export function formatDay(key: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(`${key}T00:00:00Z`),
  );
}

/**
 * ["EST", "GMT-5"] for the calendar's timezone column. Zones without a short name in English
 * (it would repeat "GMT+1") show the city instead: ["Lagos", "GMT+1"].
 */
export function timezoneLabels(instant: number, timeZone: string): [string, string] {
  const name = (style: "short" | "shortOffset") =>
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: style })
      .formatToParts(instant)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  const [short, offset] = [name("short"), name("shortOffset")];
  const city = timeZone.split("/").pop()?.replaceAll("_", " ") ?? timeZone;
  return [short === offset ? city : short, offset];
}
