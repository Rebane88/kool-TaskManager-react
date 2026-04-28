/**
 * Auth API endpoint wrappers.
 *
 * All auth HTTP requests are routed exclusively through apiClient (ARCH-02).
 * No direct fetch() calls exist in this module — transport is centralized.
 *
 * Endpoints (TalTech backend):
 *  POST /api/v1/Account/Register
 *  POST /api/v1/Account/Login
 *  POST /api/v1/Account/RefreshToken
 *
 * Error normalization: errors propagate as ApiError from apiClient.
 * Response validation (T-01-04): malformed responses are rejected by apiClient.
 */

import { apiClient } from "@/lib/api/apiClient";

const API_VERSION = "1";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://taltech.akaver.com";

function endpoint(path: string): string {
  return `${BASE_URL}/api/v${API_VERSION}/${path}`;
}

// ---------------------------------------------------------------------------
// Request / response types (aligned with TalTech OpenAPI schema)
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** Body for POST /Account/RefreshToken — matches RefreshTokenModel schema */
export interface RefreshTokenRequest {
  /** Current (possibly expired) access JWT */
  jwt: string;
  /** Valid refresh token */
  refreshToken: string;
}

/** Successful auth response from login, register, and refresh endpoints */
export interface JwtResponse {
  token: string | null;
  refreshToken: string | null;
  firstName: string | null;
  lastName: string | null;
}

// ---------------------------------------------------------------------------
// Auth API wrappers
// ---------------------------------------------------------------------------

export const authApi = {
  /**
   * Register a new account.
   * Returns JWT + refreshToken on success.
   * Throws ApiError on failure (e.g., email already in use — 400).
   */
  async register(req: RegisterRequest): Promise<JwtResponse> {
    return apiClient<JwtResponse>({
      method: "POST",
      url: endpoint("Account/Register"),
      body: req,
    });
  },

  /**
   * Login with email and password.
   * Returns JWT + refreshToken on success.
   * Throws ApiError on failure (e.g., invalid credentials — 404).
   */
  async login(req: LoginRequest): Promise<JwtResponse> {
    return apiClient<JwtResponse>({
      method: "POST",
      url: endpoint("Account/Login"),
      body: req,
    });
  },

  /**
   * Exchange an expired JWT + valid refreshToken for a new JWT pair.
   * Returns new JWT + refreshToken on success.
   * Throws ApiError on failure (e.g., expired refresh token — 400).
   */
  async refresh(req: RefreshTokenRequest): Promise<JwtResponse> {
    return apiClient<JwtResponse>({
      method: "POST",
      url: endpoint("Account/RefreshToken"),
      body: req,
    });
  },
};
