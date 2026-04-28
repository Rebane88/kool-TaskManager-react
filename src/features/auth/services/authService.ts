/**
 * Auth service — orchestrates auth actions with token lifecycle policy.
 *
 * Responsibilities:
 *  - Route register/login/logout through authApi
 *  - Enforce D-01 token storage boundary:
 *    access JWT → memory only (tokenMemoryStore)
 *    refresh token → localStorage (refreshTokenStorage)
 *  - Propagate ApiError on auth failures without storing tokens (T-01-14)
 *
 * AUTH-01: register flow
 * AUTH-02: login flow
 * AUTH-03: logout flow
 * AUTH-05: token storage policy
 */

import { authApi, LoginRequest, RegisterRequest } from "@/features/auth/api/authApi";
import {
  setAccessToken,
  clearAccessToken,
} from "@/features/auth/storage/tokenMemoryStore";
import {
  setRefreshToken,
  clearRefreshToken,
} from "@/features/auth/storage/refreshTokenStorage";

export interface AuthResult {
  firstName: string | null;
  lastName: string | null;
}

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
};
