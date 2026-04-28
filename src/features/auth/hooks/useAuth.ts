/**
 * useAuth hook.
 *
 * Exposes auth state and actions from AuthProvider context.
 * Must be used within an <AuthProvider> tree.
 *
 * Returns:
 *   status       — "unauthenticated" | "authenticated"
 *   firstName    — name from last successful auth
 *   lastName     — name from last successful auth
 *   error        — error message from last failed auth, or null
 *   register(req) — register a new account
 *   login(req)    — login with email + password
 *   logout()      — clear session and return to unauthenticated
 */

import { useAuthContext } from "@/features/auth/state/AuthProvider";

export { type AuthContextValue as AuthContextShape } from "@/features/auth/state/AuthProvider";

export function useAuth() {
  return useAuthContext();
}
