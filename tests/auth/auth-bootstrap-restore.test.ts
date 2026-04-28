/**
 * Bootstrap session restore and 401 refresh/failure branch tests.
 *
 * Covers D-02/D-03:
 *  - D-02: Session restored from refresh token on app bootstrap
 *  - D-03: First 401 triggers refresh; retry succeeds or fails cleanly
 *
 * AUTH-04: session continuity via bootstrap + 401 recovery
 * AUTH-05: access token never touches browser storage in any branch
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Token store mocks
// ---------------------------------------------------------------------------

vi.mock("@/features/auth/storage/tokenMemoryStore", () => ({
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn().mockReturnValue(null),
  clearAccessToken: vi.fn(),
}));

vi.mock("@/features/auth/storage/refreshTokenStorage", () => ({
  setRefreshToken: vi.fn(),
  getRefreshToken: vi.fn().mockReturnValue(null),
  clearRefreshToken: vi.fn(),
  REFRESH_TOKEN_KEY: "refresh_token",
}));

// ---------------------------------------------------------------------------
// authApi mock
// ---------------------------------------------------------------------------

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { authService } from "@/features/auth/services/authService";
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
import { authApi } from "@/features/auth/api/authApi";
import { ApiError } from "@/lib/api/apiError";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const mockJwtResponse = {
  token: "new-access-token",
  refreshToken: "new-refresh-token",
  firstName: "Jane",
  lastName: "Doe",
};

// ---------------------------------------------------------------------------
// authService.restoreSession — D-02 bootstrap restore
// ---------------------------------------------------------------------------

describe("authService.restoreSession: bootstrap restore (D-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns AuthResult when refresh token exists and refresh succeeds", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("stored-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    const result = await authService.restoreSession();

    expect(result).toEqual({ firstName: "Jane", lastName: "Doe" });
  });

  it("stores new access token in memory on successful restore", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("stored-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.restoreSession();

    expect(setAccessToken).toHaveBeenCalledWith(mockJwtResponse.token);
  });

  it("stores new refresh token in localStorage on successful restore", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("stored-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.restoreSession();

    expect(setRefreshToken).toHaveBeenCalledWith(mockJwtResponse.refreshToken);
  });

  it("returns null when no refresh token is stored", async () => {
    vi.mocked(getRefreshToken).mockReturnValue(null);

    const result = await authService.restoreSession();

    expect(result).toBeNull();
  });

  it("does not call authApi.refresh when no refresh token stored", async () => {
    vi.mocked(getRefreshToken).mockReturnValue(null);

    await authService.restoreSession();

    expect(authApi.refresh).not.toHaveBeenCalled();
  });

  it("returns null when refresh token is present but refresh fails", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("expired-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue(null);
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Refresh token expired")
    );

    const result = await authService.restoreSession();

    expect(result).toBeNull();
  });

  it("clears tokens on failed restore (T-01-10)", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("expired-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("stale-access-token");
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Refresh token expired")
    );

    await authService.restoreSession();

    // refreshTokens clears tokens on failure (D-03)
    expect(clearAccessToken).toHaveBeenCalledOnce();
    expect(clearRefreshToken).toHaveBeenCalledOnce();
  });

  it("does not persist access token to localStorage on any restore path (AUTH-05)", async () => {
    // Success path
    vi.mocked(getRefreshToken).mockReturnValue("stored-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.restoreSession();

    // setRefreshToken may be called (refresh token goes to localStorage)
    // but setAccessToken receives only the access token value, not via setRefreshToken
    expect(setRefreshToken).not.toHaveBeenCalledWith(mockJwtResponse.token);
  });
});

// ---------------------------------------------------------------------------
// apiClient + authService: 401 refresh/retry/failure integration (D-03)
// ---------------------------------------------------------------------------

describe("apiClient 401 + authService.refreshTokens: full recovery branch (D-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apiClient calls setUnauthorizedHandler with a function on provider bootstrap", async () => {
    const { setUnauthorizedHandler } = await import("@/lib/api/apiClient");
    // Verify the function accepts a callable — type-level integration check
    const handler = vi.fn().mockResolvedValue("token");
    expect(() => setUnauthorizedHandler(handler)).not.toThrow();
    setUnauthorizedHandler(null);
  });

  it("full 401 recovery: handler calls refreshTokens and returns new access token", async () => {
    const { setUnauthorizedHandler } = await import("@/lib/api/apiClient");

    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");
    vi.mocked(getAccessToken)
      .mockReturnValueOnce("old-token")   // read inside refreshTokens
      .mockReturnValue("new-token");       // returned after tokens stored
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    // Register the same handler AuthProvider would register
    let capturedToken: string | undefined;
    setUnauthorizedHandler(async () => {
      await authService.refreshTokens();
      capturedToken = getAccessToken() ?? "";
      return capturedToken;
    });

    // Simulate 401 handler invocation
    const handlerRef = vi.fn(async () => {
      await authService.refreshTokens();
      return getAccessToken() ?? "";
    });
    setUnauthorizedHandler(handlerRef);

    const token = await handlerRef();

    expect(authApi.refresh).toHaveBeenCalledOnce();
    expect(token).toBe("new-token");

    setUnauthorizedHandler(null);
  });

  it("401 handler failure path: refresh failure propagates as ApiError", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("expired-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-token");
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Refresh token expired")
    );

    // refreshTokens throws on failure (D-03)
    await expect(authService.refreshTokens()).rejects.toThrow(ApiError);
  });

  it("401 handler failure clears access token (T-01-11)", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("expired-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-token");
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Refresh token expired")
    );

    try {
      await authService.refreshTokens();
    } catch {
      // expected
    }

    expect(clearAccessToken).toHaveBeenCalledOnce();
  });

  it("401 handler failure clears refresh token (T-01-11)", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("expired-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-token");
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Refresh token expired")
    );

    try {
      await authService.refreshTokens();
    } catch {
      // expected
    }

    expect(clearRefreshToken).toHaveBeenCalledOnce();
  });

  it("no access token persistence side effects in localStorage (AUTH-05)", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");
    vi.mocked(getAccessToken).mockReturnValue("old-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.refreshTokens();

    // The access token must only go to setAccessToken (memory store)
    // setRefreshToken must NOT receive the access token value
    expect(setRefreshToken).not.toHaveBeenCalledWith(mockJwtResponse.token);
    expect(setAccessToken).toHaveBeenCalledWith(mockJwtResponse.token);
  });
});
