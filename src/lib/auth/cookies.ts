// Cookie names and options shared by the server actions and the proxy.
// All are HttpOnly, so page JavaScript can never read the tokens.

export const ACCESS_COOKIE = "proben_access";
export const REFRESH_COOKIE = "proben_refresh";
/** The sign-in or sign-up step in progress (challenge or verification token). */
export const FLOW_COOKIE = "proben_auth_flow";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

// The backend allows refresh tokens up to 30 days (organisation setting).
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;
// Codes and verification tokens last 10 minutes.
export const FLOW_MAX_AGE = 10 * 60;

/** Cookies to set for a new token pair. The access cookie lapses 60s early so it's refreshed in time. */
export function tokenCookies(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}) {
  return [
    {
      name: ACCESS_COOKIE,
      value: tokens.accessToken,
      ...cookieOptions,
      maxAge: Math.max(tokens.expiresIn - 60, 30),
    },
    { name: REFRESH_COOKIE, value: tokens.refreshToken, ...cookieOptions, maxAge: REFRESH_MAX_AGE },
  ];
}
