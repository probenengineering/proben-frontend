import { apiBase } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";

// Uploads a task file (POST /api/files, multipart: file + clientUploadId + source) for the
// signed-in person. The files service needs the access token, which only the server holds, so
// the form is forwarded from here. A route handler, not a server action: actions cap bodies at 1 MB.

const MAX_BYTES = 10 * 1024 * 1024;
const PURPOSES = new Set(["staff_avatar", "message_attachment"]);

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) return Response.json({ message: "Sign in to upload files." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) {
    return Response.json({ message: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ message: "Files can be up to 10 MB." }, { status: 413 });
  }

  const body = new FormData();
  body.set("file", file, file.name);
  body.set("clientUploadId", String(form.get("clientUploadId") ?? crypto.randomUUID()));
  // `source` is the physical source, not the feature: task and HR uploads use "document".
  body.set("source", "document");
  // What the file is for: a staff photo (JPG/PNG up to 5 MB) or a task reference (Assign task).
  // Left out, the files service applies its default (task answer uploads).
  const purpose = String(form.get("purpose") ?? "");
  if (PURPOSES.has(purpose)) body.set("purpose", purpose);

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase()}/api/files`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
      body,
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { message: "We couldn't reach Proben. Check your connection and try again." },
      { status: 503 },
    );
  }
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return Response.json(
      { message: data?.message ?? "We couldn't upload this file. Try again." },
      { status: upstream.status },
    );
  }
  return Response.json({ id: data.id, name: file.name, size: file.size });
}
