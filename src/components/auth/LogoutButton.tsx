"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="rounded px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-ink transition-colors"
    >
      Log out
    </button>
  );
}
