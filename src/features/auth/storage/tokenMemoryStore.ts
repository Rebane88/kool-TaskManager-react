/**
 * In-memory access token store.
 *
 * The access JWT MUST remain in module memory only.
 * No browser storage APIs (localStorage, sessionStorage, cookie) are used.
 * This enforces AUTH-05 and threat mitigation T-01-01.
 */

let accessToken: string | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}
