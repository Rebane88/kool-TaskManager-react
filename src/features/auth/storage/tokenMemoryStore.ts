/**
 * Access token store — memory primary, localStorage fallback.
 *
 * Memory is the primary store (fast, cleared on tab close).
 * localStorage is written in parallel so a hard refresh can still recover
 * the JWT for the /Account/RefreshToken call (which requires the old JWT).
 * The stored JWT will be expired by the time restore runs in most cases,
 * but the backend accepts expired JWTs for the refresh exchange.
 */

const JWT_KEY = "jwt";

let accessToken: string | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
  try {
    localStorage.setItem(JWT_KEY, token);
  } catch {
    // localStorage unavailable (SSR, private mode quota) — memory only
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try {
    return localStorage.getItem(JWT_KEY);
  } catch {
    return null;
  }
}

export function clearAccessToken(): void {
  accessToken = null;
  try {
    localStorage.removeItem(JWT_KEY);
  } catch {
    // ignore
  }
}
