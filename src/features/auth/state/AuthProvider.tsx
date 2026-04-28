"use client";

/**
 * Auth context provider.
 *
 * Manages auth state using Context + Reducer (ARCH-02 / no prop drilling).
 * Exposes auth actions and status to all consuming components via useAuth.
 *
 * Auth status states:
 *   "unauthenticated" — no session active
 *   "authenticated"   — access token available in memory
 *
 * Actions route through authService which enforces D-01 token policy.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { authService, AuthResult } from "@/features/auth/services/authService";
import { LoginRequest, RegisterRequest } from "@/features/auth/api/authApi";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export type AuthStatus = "restoring" | "unauthenticated" | "authenticated";

export interface AuthState {
  status: AuthStatus;
  firstName: string | null;
  lastName: string | null;
  error: string | null;
}

const initialState: AuthState = {
  status: "unauthenticated",
  firstName: null,
  lastName: null,
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer actions
// ---------------------------------------------------------------------------

type AuthAction =
  | { type: "AUTH_SUCCESS"; payload: AuthResult }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_SUCCESS":
      return {
        status: "authenticated",
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...initialState,
        error: action.payload,
      };
    case "LOGOUT":
      return { ...initialState };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface AuthContextValue extends AuthState {
  register: (req: RegisterRequest) => Promise<void>;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const register = useCallback(async (req: RegisterRequest): Promise<void> => {
    try {
      const result = await authService.register(req);
      dispatch({ type: "AUTH_SUCCESS", payload: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err; // re-throw so UI can handle errors
    }
  }, []);

  const login = useCallback(async (req: LoginRequest): Promise<void> => {
    try {
      const result = await authService.login(req);
      dispatch({ type: "AUTH_SUCCESS", payload: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      throw err; // re-throw so UI can handle errors
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    dispatch({ type: "LOGOUT" });
  }, []);

  const value: AuthContextValue = {
    ...state,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Context accessor (used by useAuth hook)
// ---------------------------------------------------------------------------

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
