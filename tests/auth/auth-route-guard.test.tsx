/**
 * Route guard tests.
 *
 * Covers:
 *  - RequireAuth: redirects unauthenticated users to /login
 *  - RequireAuth: shows loading indicator during session restore
 *  - RequireAuth: renders children when authenticated
 *  - Login page: redirects authenticated users to /dashboard
 *  - Register page: redirects authenticated users to /dashboard
 *
 * AUTH-02: login access control
 * AUTH-03: authenticated session continuity
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// ---------------------------------------------------------------------------
// Mock useAuth
// ---------------------------------------------------------------------------

const mockUseAuth = vi.fn();
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { RequireAuth } from "@/components/auth/RequireAuth";

// ---------------------------------------------------------------------------
// RequireAuth tests
// ---------------------------------------------------------------------------

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when status is 'unauthenticated'", () => {
    it("calls router.replace('/login')", () => {
      mockUseAuth.mockReturnValue({ status: "unauthenticated" });

      render(
        <RequireAuth>
          <div>Protected content</div>
        </RequireAuth>
      );

      expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("renders null (no content flash)", () => {
      mockUseAuth.mockReturnValue({ status: "unauthenticated" });

      const { container } = render(
        <RequireAuth>
          <div>Protected content</div>
        </RequireAuth>
      );

      expect(screen.queryByText("Protected content")).toBeNull();
      expect(container.firstChild).toBeNull();
    });
  });

  describe("when status is 'restoring'", () => {
    it("renders loading indicator", () => {
      mockUseAuth.mockReturnValue({ status: "restoring" });

      render(
        <RequireAuth>
          <div>Protected content</div>
        </RequireAuth>
      );

      expect(screen.getByText("Loading...")).toBeDefined();
    });

    it("does NOT render children", () => {
      mockUseAuth.mockReturnValue({ status: "restoring" });

      render(
        <RequireAuth>
          <div>Protected content</div>
        </RequireAuth>
      );

      expect(screen.queryByText("Protected content")).toBeNull();
    });

    it("does NOT call router.replace", () => {
      mockUseAuth.mockReturnValue({ status: "restoring" });

      render(
        <RequireAuth>
          <div>Protected content</div>
        </RequireAuth>
      );

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("when status is 'authenticated'", () => {
    it("renders children", () => {
      mockUseAuth.mockReturnValue({ status: "authenticated" });

      render(
        <RequireAuth>
          <div>Protected content</div>
        </RequireAuth>
      );

      expect(screen.getByText("Protected content")).toBeDefined();
    });

    it("does NOT call router.replace", () => {
      mockUseAuth.mockReturnValue({ status: "authenticated" });

      render(
        <RequireAuth>
          <div>Protected content</div>
        </RequireAuth>
      );

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// (auth) page redirect tests — loaded lazily after auth pages are updated
// ---------------------------------------------------------------------------

describe("Login page redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects authenticated user to /dashboard", async () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      login: vi.fn(),
    });

    // Dynamically import so it picks up the mock
    const { default: LoginPage } = await import("@/app/(auth)/login/page");

    render(<LoginPage />);

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});

describe("Register page redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects authenticated user to /dashboard", async () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      register: vi.fn(),
    });

    const { default: RegisterPage } = await import(
      "@/app/(auth)/register/page"
    );

    render(<RegisterPage />);

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});
