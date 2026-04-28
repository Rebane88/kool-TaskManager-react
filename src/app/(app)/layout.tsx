import React from "react";
import LogoutButton from "@/components/auth/LogoutButton";

/**
 * Authenticated app layout.
 *
 * Renders a top navigation bar with LogoutButton so logout is reachable
 * from all authenticated screens (AUTH-03).
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-semibold">TaskManager</span>
        <LogoutButton />
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
