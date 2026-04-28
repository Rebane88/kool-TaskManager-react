"use client";

/**
 * RequireAuth component.
 *
 * Guards (app) routes based on auth state from useAuth().
 *
 * Behavior:
 *   "unauthenticated" — redirect to /login, render null (no content flash)
 *   "restoring"       — show loading indicator, do NOT render children
 *   "authenticated"   — render children normally
 *
 * Threat mitigations:
 *   T-01-19: null render on unauthenticated prevents child content from flashing
 *   T-01-20: loading indicator on restoring prevents protected content exposure
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "restoring") {
    return <div aria-label="Loading session">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
