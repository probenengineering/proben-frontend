import { fileStatusAction } from "./actions";

// Task reference upload (handover S18–S19), from the browser: POST /api/files (our proxy) with
// purpose=message_attachment, then wait for the malware scan; only "clean" files can be linked.
// Returns the file id, or throws with a message to show.

const POLL_MS = 1000;
const POLL_TRIES = 30;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function uploadTaskReference(file: File): Promise<string> {
  const body = new FormData();
  body.set("file", file);
  body.set("clientUploadId", crypto.randomUUID());
  body.set("purpose", "message_attachment");
  const res = await fetch("/api/files", { method: "POST", body }).catch(() => null);
  const data = res ? await res.json().catch(() => ({})) : {};
  if (!res?.ok || !data.id) {
    throw new Error(data.message ?? `We couldn't upload ${file.name}. Try again.`);
  }
  const id = String(data.id);
  for (let i = 0; i < POLL_TRIES; i++) {
    const result = await fileStatusAction(id);
    const status = result.ok ? result.data.status : "unknown";
    if (status === "clean") return id;
    if (status !== "pending_scan") {
      throw new Error(`${file.name} can't be attached. Try a different file.`);
    }
    await wait(POLL_MS);
  }
  throw new Error(`${file.name} is still being checked. Try again in a moment.`);
}
