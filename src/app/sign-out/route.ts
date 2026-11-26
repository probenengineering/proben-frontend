import { NextResponse, type NextRequest } from "next/server";

import { clearSession } from "@/lib/auth/session";

// Where a rejected session goes (the backend answered 401, or the live connection ended).
// Pages can't delete cookies while rendering, so this clears them, then opens /sign-in.
// Without it the proxy still sees the old cookie and sends /sign-in straight back to the app.
export async function GET(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
