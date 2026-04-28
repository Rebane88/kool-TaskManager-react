import React from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * Authenticated app layout.
 *
 * Wraps all (app) routes in RequireAuth to enforce authentication (AUTH-02/AUTH-03).
 * Renders a top navigation bar with links to Dashboard, Categories, Priorities,
 * and a LogoutButton so logout is reachable from all authenticated screens (AUTH-03, D-03).
 *
 * AppLayout is a Server Component — RequireAuth is the client boundary.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-screen">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">TaskManager</span>
            <nav className="flex items-center gap-4 text-sm" aria-label="Main navigation">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Dashboard</Link>
              <Link href="/categories" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Categories</Link>
              <Link href="/priorities" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Priorities</Link>
            </nav>
          </div>
          <LogoutButton />
        </header>
        <main className="p-4">{children}</main>
      </div>
    </RequireAuth>
  );
}
