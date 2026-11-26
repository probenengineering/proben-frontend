// Display formats taken from the Figma "My time" card.

const pad = (n: number) => String(n).padStart(2, "0");

/** Duration as "HH : MM", e.g. "03 : 10" (v1 card; kept for other callers). */
export function formatTimer(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  return `${pad(Math.floor(minutes / 60))} : ${pad(minutes % 60)}`;
}

/** v2 ring timer: worked time as "03:10" (hours:minutes). */
export function formatHoursMinutes(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** v2 ring timer on break: time left as "20:00" (minutes:seconds, rounded up). */
export function formatCountdown(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

/** Duration as "3h 30m". Countdowns round "up" so 59s left reads "0h 1m", not "0h 0m". */
export function formatDuration(ms: number, round: "down" | "up" = "down") {
  const minutes = (round === "up" ? Math.ceil : Math.floor)(ms / 60_000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** "30 min", or "1h 15m" past an hour. */
export function formatMinutes(minutes: number) {
  const whole = Math.round(minutes);
  return whole < 60 ? `${whole} min` : formatDuration(whole * 60_000);
}

/** Clock time as "08 : 00 AM". */
export function formatClockTime(timestamp: number) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  return `${pad(hours % 12 || 12)} : ${pad(date.getMinutes())} ${hours < 12 ? "AM" : "PM"}`;
}

/** Distance as Figma writes it, "1.2 mi" (one decimal). */
export function formatMiles(meters: number) {
  return `${(meters / 1609.344).toFixed(1)} mi`;
}
