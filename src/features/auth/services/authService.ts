/**
 * Auth service — orchestrates auth actions with token lifecycle policy.
 *
 * Responsibilities:
 *  - Route register/login/logout through authApi
 *  - Enforce D-01 token storage boundary:
 *    access JWT → memory only (tokenMemoryStore)
 *    refresh token → localStorage (refreshTokenStorage)
 *  - Propagate ApiError on auth failures without storing tokens (T-01-14)
 *  - restoreSession: bootstrap restore of authenticated session (D-02)
 *  - refreshTokens: single-flight refresh lock + one-retry policy (D-03/D-04)
 *
 * AUTH-01: register flow
 * AUTH-02: login flow
 * AUTH-03: logout flow
 * AUTH-04: session restore + refresh-on-401
 * AUTH-05: token storage policy
 */

import { authApi, LoginRequest, RegisterRequest } from "@/features/auth/api/authApi";
import {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
} from "@/features/auth/storage/tokenMemoryStore";
import {
  setRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from "@/features/auth/storage/refreshTokenStorage";

export interface AuthResult {
  firstName: string | null;
  lastName: string | null;
}

// ---------------------------------------------------------------------------
// Single-flight refresh lock (D-04)
// ---------------------------------------------------------------------------

/** In-flight refresh promise shared across concurrent callers. */
let refreshInFlight: Promise<AuthResult> | null = null;

// ---------------------------------------------------------------------------
// Auth service
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * Register a new account.
   *
   * On success: stores access token in memory, refresh token in localStorage.
   * On failure: propagates ApiError — no tokens are stored.
   */
  async register(req: RegisterRequest): Promise<AuthResult> {
    const response = await authApi.register(req);

    // Only store tokens after successful API call (T-01-14)
    if (response.token) {
      setAccessToken(response.token);
    }
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken);
    }

    return {
      firstName: response.firstName,
      lastName: response.lastName,
    };
  },

  /**
   * Login with email and password.
   *
   * On success: stores access token in memory, refresh token in localStorage.
   * On failure: propagates ApiError — no tokens are stored.
   */
  async login(req: LoginRequest): Promise<AuthResult> {
    const response = await authApi.login(req);

    // Only store tokens after successful API call (T-01-14)
    if (response.token) {
      setAccessToken(response.token);
    }
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken);
    }

    return {
      firstName: response.firstName,
      lastName: response.lastName,
    };
  },

  /**
   * Logout the current user.
   *
   * Clears both access token from memory and refresh token from localStorage.
   * Uses explicit clearing path (T-01-13) — no partial state possible.
   */
  async logout(): Promise<void> {
    clearAccessToken();
    clearRefreshToken();
  },

  /**
   * Exchange current tokens for a fresh JWT pair.
   *
   * Single-flight lock (D-04): if a refresh is already in progress, concurrent
   * callers receive the same promise — only one HTTP request is issued.
   *
   * On success: stores new access token in memory, new refresh token in localStorage.
   * On failure: clears both tokens and propagates ApiError — caller must force logout.
   *
   * AUTH-04 / D-03 / D-04
   */
  async refreshTokens(): Promise<AuthResult> {
    // Return the existing in-flight promise if one is running (D-04)
    if (refreshInFlight) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      try {
        const currentAccessToken = getAccessToken();
        const currentRefreshToken = getRefreshToken();

        const response = await authApi.refresh({
          jwt: currentAccessToken,
          refreshToken: currentRefreshToken,
        });

        // Store new tokens on success (T-01-14)
        if (response.token) {
          setAccessToken(response.token);
        }
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }

        return {
          firstName: response.firstName,
          lastName: response.lastName,
        };
      } catch (err) {
        // Refresh failed — clear all tokens and re-throw so callers force logout (D-03)
        clearAccessToken();
        clearRefreshToken();
        throw err;
      } finally {
        // Release lock so a subsequent call starts a fresh refresh (D-04)
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  },

  /**
   * Restore authenticated session from stored refresh token.
   *
   * Called once on app bootstrap (D-02). Attempts token exchange using the
   * persisted refresh token. On success, stores new tokens and returns auth
   * result. On failure or missing refresh token, returns null — caller
   * transitions to unauthenticated state.
   *
   * AUTH-04 / D-02
   */
  async restoreSession(): Promise<AuthResult | null> {
    const storedRefreshToken = getRefreshToken();
    if (!storedRefreshToken) {
      // No persisted refresh token — nothing to restore
      return null;
    }

    try {
      return await authService.refreshTokens();
    } catch {
      // Restore failed (expired/invalid refresh token) — already cleared by refreshTokens
      return null;
    }
  },
};
