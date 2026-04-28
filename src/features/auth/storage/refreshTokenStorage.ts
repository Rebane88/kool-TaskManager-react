/**
 * Refresh token localStorage adapter.
 *
 * The refresh token is the only auth value persisted in browser storage (D-01).
 * Uses localStorage.setItem / getItem / removeItem exclusively.
 * This enforces AUTH-05 and threat mitigation T-01-02.
 */

export const REFRESH_TOKEN_KEY = "refresh_token";

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
