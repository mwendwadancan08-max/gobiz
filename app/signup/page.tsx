"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

const bgImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=85";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: fullName.trim(),
        email: cleanEmail,
        password,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Unable to create your account. Please try again."
        );
        return;
      }

      try {
        const response = await fetch("/api/auth/profile", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          setMessage(
            "Your account was created, but setup did not fully complete. Please contact support before registering again."
          );
          return;
        }
      } catch {
        setMessage(
          "Your account was created, but setup did not fully complete. Please contact support before registering again."
        );
        return;
      }

      setMessage("Your account has been created. You can now sign in.");

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${bgImage}")` }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-green-950/95 via-green-900/85 to-red-950/75"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-red-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-green-500/20 blur-3xl"
      />

      <Link
        href="/signin"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-green-900"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to sign in
      </Link>

      <section className="relative z-10 w-full max-w-md">
        <header className="mb-7 text-center">
          <div className="text-5xl font-black tracking-tight sm:text-6xl">
            <span className="text-green-400 drop-shadow-[0_2px_20px_rgba(34,197,94,0.35)]">
              Go
            </span>
            <span className="text-red-400 drop-shadow-[0_2px_20px_rgba(239,68,68,0.35)]">
              Biz
            </span>
          </div>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
            Powered by{" "}
            <span className="font-bold tracking-normal text-white">
              DBC.creatives
            </span>
          </p>

          <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/85">
            Create your GoBiz account to get started.
          </p>
        </header>

        <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-neutral-600">
              Enter your details below to get started.
            </p>
          </div>

          {message && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-800"
            >
              {message}
              {message.startsWith("Your account has been created") && (
                <div className="mt-2">
                  <Link
                    href="/signin"
                    className="font-bold underline underline-offset-2 hover:text-green-900"
                  >
                    Go to sign in →
                  </Link>
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Full name
              </label>

              <input
                id="fullName"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 text-sm text-neutral-900 outline-none backdrop-blur transition placeholder:text-neutral-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/15"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 text-sm text-neutral-900 outline-none backdrop-blur transition placeholder:text-neutral-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 pr-20 text-sm text-neutral-900 outline-none backdrop-blur transition placeholder:text-neutral-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-3 text-xs font-semibold text-neutral-500 transition hover:text-green-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 pr-20 text-sm text-neutral-900 outline-none backdrop-blur transition placeholder:text-neutral-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/15"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  className="absolute inset-y-0 right-3 text-xs font-semibold text-neutral-500 transition hover:text-green-800"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-green-800 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-700/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-200/70 pt-5">
            <p className="text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-bold text-green-800 hover:text-green-900 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <footer className="mt-6 text-center text-[11px] text-white/70">
          <span>GoBiz</span>
          <span className="mx-2 text-white/40">•</span>
          <span>Meals and farm products</span>
          <span className="mx-2 text-white/40">•</span>
          <a
            href="https://dbc-pi-two.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/40 underline-offset-4 transition hover:text-white"
          >
            DBC.creatives
          </a>
        </footer>
      </section>
    </main>
  );
}