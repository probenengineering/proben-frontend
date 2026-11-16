import { EMPTY_CLOCK, type ShiftClock } from "./types";

// TEMPORARY stand-in for the time-clock API (docs/command-center.md). Keeps the clock in
// localStorage so a refresh doesn't reset it. Each action maps 1:1 to a proposed endpoint;
// when the backend lands, replace the bodies with fetches and keep the same signatures.

const KEY = "proben.shift-clock";
const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cached: ShiftClock = EMPTY_CLOCK;

function read(): ShiftClock {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? (JSON.parse(raw) as ShiftClock) : EMPTY_CLOCK;
  } catch {
    cached = EMPTY_CLOCK;
  }
  return cached;
}

function write(next: ShiftClock) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): keep the state in memory for this tab.
    cached = next;
    cachedRaw = undefined;
  }
  listeners.forEach((notify) => notify());
}

export const shiftClockStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => event.key === KEY && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY_CLOCK,
};

/** POST /time-clock/clock-in */
export function clockIn() {
  const clock = read();
  if (clock.status !== "not_clocked_in") return;
  write({ status: "clocked_in", clockedInAt: Date.now(), breaks: [] });
}

/** POST /time-clock/breaks/start */
export function startBreak() {
  const clock = read();
  if (clock.status !== "clocked_in") return;
  write({
    ...clock,
    status: "on_break",
    breaks: [...clock.breaks, { startedAt: Date.now(), endedAt: null }],
  });
}

/** POST /time-clock/breaks/end */
export function endBreak() {
  const clock = read();
  if (clock.status !== "on_break") return;
  const now = Date.now();
  write({
    ...clock,
    status: "clocked_in",
    breaks: clock.breaks.map((b) => (b.endedAt === null ? { ...b, endedAt: now } : b)),
  });
}

/** POST /time-clock/clock-out. No clocked-out frame yet, so the card returns to "Not clocked in". */
export function clockOut() {
  const clock = read();
  if (clock.status !== "clocked_in") return;
  write(EMPTY_CLOCK);
}
