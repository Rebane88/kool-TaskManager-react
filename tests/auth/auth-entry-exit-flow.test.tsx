/**
 * Auth entry/exit flow tests.
 *
 * Covers:
 *  - authService: token lifecycle policy (access=memory, refresh=localStorage)
 *  - AuthProvider + useAuth: register, login, logout actions
 *  - Token stores are set/cleared appropriately on each auth action
 *
 * AUTH-01: register flow
 * AUTH-02: login flow
 * AUTH-03: logout flow
 * AUTH-05: token storage policy (access=memory-only, refresh=localStorage)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";

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
    register: vi.fn().mockResolvedValue({
      token: "access-token-abc",
      refreshToken: "refresh-token-xyz",
      firstName: "Jane",
      lastName: "Doe",
    }),
    login: vi.fn().mockResolvedValue({
      token: "access-token-abc",
      refreshToken: "refresh-token-xyz",
      firstName: "Jane",
      lastName: "Doe",
    }),
    refresh: vi.fn().mockResolvedValue({
      token: "access-token-abc",
      refreshToken: "refresh-token-xyz",
      firstName: "Jane",
      lastName: "Doe",
    }),
  },
}));

const mockJwtResponse = {
  token: "access-token-abc",
  refreshToken: "refresh-token-xyz",
  firstName: "Jane",
  lastName: "Doe",
};

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { authService } from "@/features/auth/services/authService";
import { AuthProvider } from "@/features/auth/state/AuthProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
// Helper: test component that exposes useAuth output
// ---------------------------------------------------------------------------

let capturedAuth: ReturnType<typeof useAuth> | null = null;

function TestConsumer() {
  capturedAuth = useAuth();
  return <div data-testid="auth-state">{capturedAuth.status}</div>;
}

function renderWithProvider() {
  capturedAuth = null;
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

// ---------------------------------------------------------------------------
// authService: token lifecycle policy
// ---------------------------------------------------------------------------

describe("authService: token lifecycle policy (AUTH-05)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login sets access token in memory store only", async () => {
    await authService.login({ email: "a@b.com", password: "pass" });

    // Access token must flow through setAccessToken (memory store), not via setRefreshToken
    expect(setAccessToken).toHaveBeenCalledWith(mockJwtResponse.token);
    // setRefreshToken must NOT receive the access token value
    expect(setRefreshToken).not.toHaveBeenCalledWith(mockJwtResponse.token);
  });

  it("login persists refresh token to localStorage", async () => {
    await authService.login({ email: "a@b.com", password: "pass" });

    expect(setRefreshToken).toHaveBeenCalledWith(mockJwtResponse.refreshToken);
  });

  it("register sets access token in memory store only", async () => {
    await authService.register({
      email: "a@b.com",
      password: "pass",
      firstName: "Jane",
      lastName: "Doe",
    });

    // Access token must flow through setAccessToken (memory store), not via setRefreshToken
    expect(setAccessToken).toHaveBeenCalledWith(mockJwtResponse.token);
    // setRefreshToken must NOT receive the access token value
    expect(setRefreshToken).not.toHaveBeenCalledWith(mockJwtResponse.token);
  });

  it("register persists refresh token to localStorage", async () => {
    await authService.register({
      email: "a@b.com",
      password: "pass",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(setRefreshToken).toHaveBeenCalledWith(mockJwtResponse.refreshToken);
  });

  it("logout clears access token from memory store", async () => {
    await authService.logout();

    expect(clearAccessToken).toHaveBeenCalledOnce();
  });

  it("logout clears refresh token from localStorage", async () => {
    await authService.logout();

    expect(clearRefreshToken).toHaveBeenCalledOnce();
  });

  it("login routes through authApi.login (not direct fetch)", async () => {
    await authService.login({ email: "x@x.com", password: "p" });

    expect(authApi.login).toHaveBeenCalledWith({ email: "x@x.com", password: "p" });
  });

  it("register routes through authApi.register (not direct fetch)", async () => {
    await authService.register({
      email: "x@x.com",
      password: "p",
      firstName: "X",
      lastName: "Y",
    });

    expect(authApi.register).toHaveBeenCalledWith({
      email: "x@x.com",
      password: "p",
      firstName: "X",
      lastName: "Y",
    });
  });

  it("login propagates ApiError on failure without storing tokens", async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(
      new ApiError(404, "Invalid credentials")
    );

    await expect(
      authService.login({ email: "bad@b.com", password: "wrong" })
    ).rejects.toThrow(ApiError);

    expect(setAccessToken).not.toHaveBeenCalled();
    expect(setRefreshToken).not.toHaveBeenCalled();
  });

  it("register propagates ApiError on failure without storing tokens", async () => {
    vi.mocked(authApi.register).mockRejectedValueOnce(
      new ApiError(400, "Email in use")
    );

    await expect(
      authService.register({
        email: "dup@b.com",
        password: "p",
        firstName: "A",
        lastName: "B",
      })
    ).rejects.toThrow(ApiError);

    expect(setAccessToken).not.toHaveBeenCalled();
    expect(setRefreshToken).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// useAuth: exports register, login, logout actions
// ---------------------------------------------------------------------------

describe("useAuth: exposes auth actions and status (AUTH-01/AUTH-02/AUTH-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authApi.login).mockResolvedValue(mockJwtResponse);
    vi.mocked(authApi.register).mockResolvedValue(mockJwtResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("provides a register action", () => {
    renderWithProvider();
    expect(typeof capturedAuth!.register).toBe("function");
  });

  it("provides a login action", () => {
    renderWithProvider();
    expect(typeof capturedAuth!.login).toBe("function");
  });

  it("provides a logout action", () => {
    renderWithProvider();
    expect(typeof capturedAuth!.logout).toBe("function");
  });

  it("initial status is 'unauthenticated'", () => {
    renderWithProvider();
    expect(capturedAuth!.status).toBe("unauthenticated");
  });

  it("status becomes 'authenticated' after successful login", async () => {
    renderWithProvider();

    await act(async () => {
      await capturedAuth!.login({ email: "a@b.com", password: "pass" });
    });

    expect(capturedAuth!.status).toBe("authenticated");
  });

  it("status becomes 'authenticated' after successful register", async () => {
    renderWithProvider();

    await act(async () => {
      await capturedAuth!.register({
        email: "a@b.com",
        password: "pass",
        firstName: "Jane",
        lastName: "Doe",
      });
    });

    expect(capturedAuth!.status).toBe("authenticated");
  });

  it("status returns to 'unauthenticated' after logout", async () => {
    renderWithProvider();

    await act(async () => {
      await capturedAuth!.login({ email: "a@b.com", password: "pass" });
    });

    expect(capturedAuth!.status).toBe("authenticated");

    await act(async () => {
      await capturedAuth!.logout();
    });

    expect(capturedAuth!.status).toBe("unauthenticated");
  });

  it("login error leaves status as 'unauthenticated'", async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(
      new ApiError(404, "Invalid credentials")
    );
    renderWithProvider();

    await act(async () => {
      try {
        await capturedAuth!.login({ email: "bad@b.com", password: "wrong" });
      } catch (_) {
        // expected
      }
    });

    expect(capturedAuth!.status).toBe("unauthenticated");
  });

  it("login calls authService.login with correct credentials", async () => {
    renderWithProvider();

    await act(async () => {
      await capturedAuth!.login({ email: "test@test.com", password: "mypass" });
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "mypass",
    });
  });

  it("register calls authService.register with correct credentials", async () => {
    renderWithProvider();

    await act(async () => {
      await capturedAuth!.register({
        email: "new@test.com",
        password: "newpass",
        firstName: "New",
        lastName: "User",
      });
    });

    expect(authApi.register).toHaveBeenCalledWith({
      email: "new@test.com",
      password: "newpass",
      firstName: "New",
      lastName: "User",
    });
  });
});
