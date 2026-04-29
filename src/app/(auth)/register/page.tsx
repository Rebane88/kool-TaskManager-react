"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/lib/api/apiError";

export default function RegisterPage() {
  const { status, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "restoring" || status === "authenticated") {
    return <div aria-label="Loading session">Loading...</div>;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password || !firstName.trim() || !lastName.trim()) {
      return;
    }

    setPending(true);
    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail ?? err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="modal-surface w-full max-w-sm p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-center text-ink">Create account</h1>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-ink-muted">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink"
            placeholder="Jane"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-ink-muted">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink"
            placeholder="Doe"
          />
        </div>

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
            autoComplete="new-password"
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
          {pending ? "Creating account…" : "Register"}
        </button>
      </form>
    </div>
  );
}
