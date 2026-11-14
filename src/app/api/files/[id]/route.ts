import type { NextRequest } from "next/server";

import { apiBase } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";

// Downloads a chat file (GET /api/files/<id>?name=<file name>) for the signed-in person.
// The files service needs the access token, which only the server holds (HttpOnly cookie), so the
// file is streamed through here. The files service rechecks access (conversation membership).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest, ctx: RouteContext<"/api/files/[id]">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });
  const accessToken = await getAccessToken();
  if (!accessToken) return new Response("Sign in to download this file.", { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase()}/api/files/${id}/content`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return new Response("We couldn't reach Proben. Try again.", { status: 503 });
  }
  if (!upstream.ok || !upstream.body) {
    // Don't reveal whether a file exists to someone who can't see it.
    const status = upstream.status === 401 ? 401 : upstream.status >= 500 ? 502 : 404;
    return new Response("This file isn't available.", { status });
  }

  // Use the name shown in the chat (letters, digits, spaces, . _ - only) for the saved file.
  const name = (request.nextUrl.searchParams.get("name") ?? "file")
    .replace(/[^\w .-]/g, "_")
    .slice(0, 150);
  return new Response(upstream.body, {
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
