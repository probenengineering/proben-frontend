import "server-only";

// Calls the identity service (implementation.md section 2). Server-side only: the browser talks
// to our server actions, and tokens never reach client JavaScript.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export interface Tokens {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
}

export interface Challenge {
  verificationRequired: true;
  challengeToken: string;
  purpose: "login" | "signup" | "password_reset";
  expiresIn: number;
  resendAfter?: number;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  accessToken?: string;
}

const UNREACHABLE = "We couldn't reach Proben. Check your connection and try again.";

/** The backend gateway's address (server-only). */
export function apiBase() {
  const base = process.env.PROBEN_API_URL;
  if (!base) throw new Error("PROBEN_API_URL is not set (see .env.local).");
  return base;
}

export function identity<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(`/api/identity${path}`, options);
}

/** Any Proben service, e.g. request("/api/messaging/settings", { accessToken }). */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = options.body ? "POST" : "GET", body, accessToken } = options;
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        accept: "application/json",
        ...(body && { "content-type": "application/json" }),
        ...(accessToken && { authorization: `Bearer ${accessToken}` }),
      },
      // The API rejects unknown fields, so empty optional ones are left out.
      body: body && JSON.stringify(body, (_, value) => (value === "" ? undefined : value)),
    });
  } catch {
    throw new ApiError(503, "SERVICE_UNAVAILABLE", UNREACHABLE);
  }

  const data = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.code ?? "INTERNAL",
      data?.message ?? "Something went wrong, try again.",
      data?.details,
    );
  }
  return data as T;
}

// Messages for the codes whose backend text is too technical to show as it is.
const MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "Some details aren't valid. Check them and try again.",
  ACCOUNT_LOCKED: "Too many attempts. Your account is locked for 15 minutes.",
  ACCOUNT_NOT_ACTIVATED: "Finish signing up from your invitation email first.",
  RATE_LIMITED: "Too many attempts. Wait a moment and try again.",
  SERVICE_UNAVAILABLE: UNREACHABLE,
  INTERNAL: "Something went wrong, try again.",
};

export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return MESSAGES.INTERNAL;
  return MESSAGES[error.code] ?? error.message;
}
