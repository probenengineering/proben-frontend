// Display formats taken from the Figma "My time" card.

const pad = (n: number) => String(n).padStart(2, "0");

/** Duration as "HH : MM", e.g. "03 : 10". */
export function formatTimer(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  return `${pad(Math.floor(minutes / 60))} : ${pad(minutes % 60)}`;
}

/** Duration as "3h 30m". Countdowns round "up" so 59s left reads "0h 1m", not "0h 0m". */
export function formatDuration(ms: number, round: "down" | "up" = "down") {
  const minutes = (round === "up" ? Math.ceil : Math.floor)(ms / 60_000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** Clock time as "08 : 00 AM". */
export function formatClockTime(timestamp: number) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  return `${pad(hours % 12 || 12)} : ${pad(date.getMinutes())} ${hours < 12 ? "AM" : "PM"}`;
}
