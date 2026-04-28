"use client";

/**
 * Reusable logout button for authenticated screens.
 *
 * Calls useAuth().logout() on click (AUTH-03, T-01-13).
 * Uses explicit logout path — clears reducer state + token stores.
 */

import React from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      Log out
    </button>
  );
}
