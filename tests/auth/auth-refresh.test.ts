/**
 * Auth refresh orchestration tests.
 *
 * Covers D-02/D-03/D-04:
 *  - D-02: Session restore on bootstrap via refresh token
 *  - D-03: First 401 triggers refresh; original request retried once; failure forces logout
 *  - D-04: Single-flight refresh lock — concurrent 401s share one refresh request
 *
 * AUTH-04: refresh-based session continuity behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
// authService.refreshTokens — single-flight + retry-once
// ---------------------------------------------------------------------------

describe("authService.refreshTokens: single-flight lock (D-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("concurrent calls share one refresh request — refresh is called exactly once", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");

    // Slow refresh so concurrent calls overlap
    let resolveRefresh!: () => void;
    vi.mocked(authApi.refresh).mockReturnValueOnce(
      new Promise<typeof mockJwtResponse>((resolve) => {
        resolveRefresh = () => resolve(mockJwtResponse);
      })
    );

    // Two concurrent calls
    const p1 = authService.refreshTokens();
    const p2 = authService.refreshTokens();

    resolveRefresh();
    await Promise.all([p1, p2]);

    // Only one HTTP call to the refresh endpoint despite two callers
    expect(authApi.refresh).toHaveBeenCalledTimes(1);
  });

  it("concurrent calls both resolve to the same result", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");

    let resolveRefresh!: () => void;
    vi.mocked(authApi.refresh).mockReturnValueOnce(
      new Promise<typeof mockJwtResponse>((resolve) => {
        resolveRefresh = () => resolve(mockJwtResponse);
      })
    );

    const p1 = authService.refreshTokens();
    const p2 = authService.refreshTokens();

    resolveRefresh();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual({ firstName: "Jane", lastName: "Doe" });
    expect(r2).toEqual({ firstName: "Jane", lastName: "Doe" });
  });

  it("after first refresh settles, a new call starts a fresh refresh request", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.refreshTokens();
    await authService.refreshTokens();

    // Two sequential calls — two refresh HTTP calls
    expect(authApi.refresh).toHaveBeenCalledTimes(2);
  });
});

describe("authService.refreshTokens: token lifecycle on success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores new access token in memory on success", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.refreshTokens();

    expect(setAccessToken).toHaveBeenCalledWith(mockJwtResponse.token);
  });

  it("stores new refresh token in localStorage on success", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.refreshTokens();

    expect(setRefreshToken).toHaveBeenCalledWith(mockJwtResponse.refreshToken);
  });

  it("sends current access token and refresh token in refresh request", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("valid-refresh-token");
    vi.mocked(authApi.refresh).mockResolvedValue(mockJwtResponse);

    await authService.refreshTokens();

    expect(authApi.refresh).toHaveBeenCalledWith({
      jwt: "old-access-token",
      refreshToken: "valid-refresh-token",
    });
  });
});

describe("authService.refreshTokens: failure clears tokens (D-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears access token on refresh failure", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("bad-refresh-token");
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Invalid refresh token")
    );

    await expect(authService.refreshTokens()).rejects.toThrow(ApiError);

    expect(clearAccessToken).toHaveBeenCalledOnce();
  });

  it("clears refresh token on refresh failure", async () => {
    vi.mocked(getAccessToken).mockReturnValue("old-access-token");
    vi.mocked(getRefreshToken).mockReturnValue("bad-refresh-token");
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Invalid refresh token")
    );

    await expect(authService.refreshTokens()).rejects.toThrow(ApiError);

    expect(clearRefreshToken).toHaveBeenCalledOnce();
  });

  it("does not store new tokens on refresh failure", async () => {
    vi.mocked(getRefreshToken).mockReturnValue("bad-refresh-token");
    vi.mocked(authApi.refresh).mockRejectedValue(
      new ApiError(400, "Invalid refresh token")
    );

    await expect(authService.refreshTokens()).rejects.toThrow(ApiError);

    expect(setAccessToken).not.toHaveBeenCalled();
    expect(setRefreshToken).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// apiClient: 401 interception with retry-once (D-03)
// ---------------------------------------------------------------------------

describe("apiClient 401 interception: retry-once policy (D-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a setUnauthorizedHandler function for 401 callback injection", async () => {
    const { setUnauthorizedHandler } = await import("@/lib/api/apiClient");
    expect(typeof setUnauthorizedHandler).toBe("function");
  });

  it("calls the 401 handler when a 401 response is received", async () => {
    const { apiClient, setUnauthorizedHandler } = await import("@/lib/api/apiClient");

    const handler = vi.fn().mockResolvedValue("new-access-token");
    setUnauthorizedHandler(handler);

    // First fetch: 401, second fetch (retry): success
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: "Unauthorized" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: "success" }),
      });

    vi.stubGlobal("fetch", mockFetch);

    const result = await apiClient({ method: "GET", url: "https://example.com/api/data" });

    expect(handler).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: "success" });

    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
  });

  it("retries original request with new access token after 401", async () => {
    const { apiClient, setUnauthorizedHandler } = await import("@/lib/api/apiClient");

    const handler = vi.fn().mockResolvedValue("fresh-access-token");
    setUnauthorizedHandler(handler);

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ ok: true }),
      });

    vi.stubGlobal("fetch", mockFetch);

    await apiClient({ method: "GET", url: "https://example.com/api/protected" });

    // Second call must use the new access token as Authorization header
    const secondCallArgs = mockFetch.mock.calls[1][1];
    expect(secondCallArgs.headers["Authorization"]).toBe("Bearer fresh-access-token");

    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
  });

  it("throws ApiError if retry also returns 401 (no loop)", async () => {
    const { apiClient, setUnauthorizedHandler } = await import("@/lib/api/apiClient");

    const handler = vi.fn().mockResolvedValue("fresh-access-token");
    setUnauthorizedHandler(handler);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: "Unauthorized" }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      apiClient({ method: "GET", url: "https://example.com/api/protected" })
    ).rejects.toThrow(ApiError);

    // Exactly 2 fetch calls: original + one retry
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
  });

  it("throws ApiError immediately on 401 if no handler is registered", async () => {
    const { apiClient, setUnauthorizedHandler } = await import("@/lib/api/apiClient");

    setUnauthorizedHandler(null);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: "Unauthorized" }),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      apiClient({ method: "GET", url: "https://example.com/api/protected" })
    ).rejects.toThrow(ApiError);

    // Only one fetch — no retry when no handler registered
    expect(mockFetch).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("throws if handler throws (refresh failure path)", async () => {
    const { apiClient, setUnauthorizedHandler } = await import("@/lib/api/apiClient");

    const handler = vi.fn().mockRejectedValue(new ApiError(400, "Refresh failed"));
    setUnauthorizedHandler(handler);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({}),
    });

    vi.stubGlobal("fetch", mockFetch);

    await expect(
      apiClient({ method: "GET", url: "https://example.com/api/protected" })
    ).rejects.toThrow(ApiError);

    // Only the original request — retry never happens if handler throws
    expect(mockFetch).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
  });
});

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const mockJwtResponse = {
  token: "new-access-token",
  refreshToken: "new-refresh-token",
  firstName: "Jane",
  lastName: "Doe",
};
