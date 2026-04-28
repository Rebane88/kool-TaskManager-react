/**
 * Auth screen tests — login page, register page, LogoutButton.
 *
 * Verifies:
 *  - Register page submits to useAuth().register on form submit (AUTH-01)
 *  - Login page submits to useAuth().login on form submit (AUTH-02)
 *  - LogoutButton calls useAuth().logout on click (AUTH-03)
 *  - Required field validation before action dispatch (T-01-12)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// ---------------------------------------------------------------------------
// Mock useAuth so pages don't need a real provider in screen tests
// ---------------------------------------------------------------------------

const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockRegister = vi.fn().mockResolvedValue(undefined);
const mockLogout = vi.fn().mockResolvedValue(undefined);

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    status: "unauthenticated",
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    firstName: null,
    lastName: null,
    error: null,
  }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import LogoutButton from "@/components/auth/LogoutButton";

// ---------------------------------------------------------------------------
// Login page tests (AUTH-02)
// ---------------------------------------------------------------------------

describe("LoginPage: login form wired to useAuth().login (AUTH-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an email input", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders a password input", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /log in|sign in|login/i })
    ).toBeInTheDocument();
  });

  it("calls login action with email and password on form submit", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in|sign in|login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "secret123",
      });
    });
  });

  it("does not call login when email is empty (T-01-12)", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in|sign in|login/i }));

    // HTML5 required validation or custom check prevents submission
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("does not call login when password is empty (T-01-12)", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /log in|sign in|login/i }));

    expect(mockLogin).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Register page tests (AUTH-01)
// ---------------------------------------------------------------------------

describe("RegisterPage: register form wired to useAuth().register (AUTH-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an email input", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders a password input", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a first name input", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });

  it("renders a last name input", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("button", { name: /register|sign up|create account/i })
    ).toBeInTheDocument();
  });

  it("calls register action with all fields on form submit", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "pass123");
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.click(
      screen.getByRole("button", { name: /register|sign up|create account/i })
    );

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "pass123",
        firstName: "John",
        lastName: "Doe",
      });
    });
  });

  it("does not call register when required fields are empty (T-01-12)", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Submit without filling any fields
    await user.click(
      screen.getByRole("button", { name: /register|sign up|create account/i })
    );

    expect(mockRegister).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// LogoutButton tests (AUTH-03)
// ---------------------------------------------------------------------------

describe("LogoutButton: calls useAuth().logout on click (AUTH-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a logout button", () => {
    render(<LogoutButton />);
    expect(
      screen.getByRole("button", { name: /log out|logout|sign out/i })
    ).toBeInTheDocument();
  });

  it("calls logout action on click", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(
      screen.getByRole("button", { name: /log out|logout|sign out/i })
    );

    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
