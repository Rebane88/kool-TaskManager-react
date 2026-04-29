import React from "react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-screen">
        <header className="flex items-center justify-between px-4 py-3 navbar-surface sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <span className="font-bold text-ink tracking-tight">TaskManager</span>
            <nav className="flex items-center gap-4 text-sm" aria-label="Main navigation">
              <Link href="/dashboard" className="text-ink-muted hover:text-ink transition-colors">Dashboard</Link>
              <Link href="/categories" className="text-ink-muted hover:text-ink transition-colors">Categories</Link>
              <Link href="/priorities" className="text-ink-muted hover:text-ink transition-colors">Priorities</Link>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </RequireAuth>
  );
}
