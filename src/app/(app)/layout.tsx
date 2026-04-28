import React from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * Authenticated app layout.
 *
 * Wraps all (app) routes in RequireAuth to enforce authentication (AUTH-02/AUTH-03).
 * Renders a top navigation bar with LogoutButton so logout is reachable
 * from all authenticated screens (AUTH-03).
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
          <span className="font-semibold">TaskManager</span>
          <LogoutButton />
        </header>
        <main className="p-4">{children}</main>
      </div>
    </RequireAuth>
  );
}
