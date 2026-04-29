"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatApiError } from "@/lib/api/apiError";

export default function LoginPage() {
  const { status, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "restoring" || status === "authenticated") {
    return <div aria-label="Loading session">Loading...</div>;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setPending(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(formatApiError(err, "Login failed. Please try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="modal-surface w-full max-w-sm p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-center text-ink">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-ink-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-ink-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-action px-4 py-2 text-sm font-medium text-action-text hover:bg-action-hover disabled:opacity-50 transition-colors"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
