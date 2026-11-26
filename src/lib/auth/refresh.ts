import { ApiError, identity, type Tokens } from "./api";

// Swaps a refresh token for a new token pair. Used by the proxy (access cookie lapsed) and by
// /refresh (the backend called the access token stale). Refresh tokens are single-use (reusing one
// ends the session), so calls that arrive together with the same token share one request.
const refreshing = new Map<string, Promise<Tokens | "ended" | undefined>>();

/** New tokens; "ended" when the session is over (400/401); undefined when offline or on a 5xx. */
export function refreshTokens(refreshToken: string) {
  let pending = refreshing.get(refreshToken);
  if (!pending) {
    pending = identity<Tokens>("/auth/refresh", { body: { refreshToken } }).catch((error) =>
      error instanceof ApiError && (error.status === 400 || error.status === 401)
        ? "ended"
        : undefined,
    );
    refreshing.set(refreshToken, pending);
    // Keep the result briefly for requests still carrying the old token.
    setTimeout(() => refreshing.delete(refreshToken), 30_000);
  }
  return pending;
}
