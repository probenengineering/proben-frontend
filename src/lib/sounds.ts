"use client";

// Notification sounds, generated in the browser (Web Audio), so there are no audio files to load
// or license. "message": one soft ding. "task": a rising two-note chime, so the two are easy to
// tell apart. No Figma asset: tune the notes below to taste.
//
// Browsers only allow sound after the person has clicked, tapped or typed on the page, so the
// audio context is created on the first such gesture (primeSounds). Until then playSound is a
// no-op. Sounds closer together than MIN_GAP_MS play once, so a burst of events plays one sound.

export type SoundKind = "message" | "task";

/** [frequency Hz, start offset s, duration s] for each note. */
const NOTES: Record<SoundKind, [number, number, number][]> = {
  message: [[880, 0, 0.22]],
  task: [
    [659.25, 0, 0.18],
    [987.77, 0.13, 0.26],
  ],
};
const VOLUME = 0.12;
const MIN_GAP_MS = 2000;

let context: AudioContext | null = null;
let lastPlayed = 0;

/**
 * Which sound a new notification (socket notification.new: an inbox item) plays: tasks get the
 * chime, messages the ding, anything else none. No ding for a chat that's open and focused.
 */
export function soundForNotification(
  payload: unknown,
  pathname: string,
  focused: boolean,
): SoundKind | null {
  const item = (payload && typeof payload === "object" ? payload : {}) as {
    feedCategory?: string;
    category?: string;
    destination?: { type?: string; conversationId?: string | null } | null;
  };
  const category = item.feedCategory ?? item.category;
  if (category === "tasks" || item.destination?.type === "task") return "task";
  if (category !== "messages" && item.destination?.type !== "message") return null;
  const chat = item.destination?.conversationId;
  if (chat && focused && pathname.startsWith(`/messages/${chat}`)) return null;
  return "message";
}

/** Call once on the client: unlocks audio on the first click, tap or key press. */
export function primeSounds() {
  const unlock = () => {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
  };
  for (const event of ["pointerdown", "keydown"] as const) {
    window.addEventListener(event, unlock, { once: true, capture: true });
  }
}

function note(audio: AudioContext, frequency: number, offset: number, duration: number) {
  const start = audio.currentTime + offset;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  // Quick fade in, then a soft exponential fade out (no click at either end).
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(VOLUME, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

/** Plays a notification sound if audio is unlocked and none played in the last 2 seconds. */
export function playSound(kind: SoundKind) {
  if (!context || context.state !== "running") return;
  const now = Date.now();
  if (now - lastPlayed < MIN_GAP_MS) return;
  lastPlayed = now;
  for (const [frequency, offset, duration] of NOTES[kind]) {
    note(context, frequency, offset, duration);
  }
}
