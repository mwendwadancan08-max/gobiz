
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

type AuthMode = "signin" | "employee";

type UserProfile = {
  role: string;
  approval_status: string;
};

export default function SignInPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("signin");
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

    if (mode === "employee" && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (mode === "employee" && password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (mode === "employee" && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signin") {
        const result = await authClient.signIn.email({
          email: cleanEmail,
          password,
        });

        if (result.error) {
          setError(
            result.error.message ||
              "Unable to sign in. Check your details and try again."
          );
          return;
        }

        const response = await fetch("/api/auth/profile", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const profileResult = await response.json();

        if (!response.ok) {
          setError(
            profileResult.error ||
              "Your GoBiz profile could not be verified. Contact the administrator."
          );
          return;
        }

        const profile = profileResult as UserProfile;

        if (profile.approval_status !== "APPROVED") {
          setError(
            profile.approval_status === "PENDING"
              ? "Your account is awaiting administrator approval."
              : "Your account is not approved for workspace access."
          );
          return;
        }

        if (profile.role === "ADMIN") {
          router.replace("/admin");
          router.refresh();
          return;
        }

        if (profile.role === "EMPLOYEE") {
          router.replace("/employee");
          router.refresh();
          return;
        }

        setError("Your account has an unrecognized role.");
        return;
      }

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

      /*
       * This endpoint must securely connect the authenticated Neon Auth
       * user to app_users using the server-side session.
       */
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });

      const profileResult = await response.json();

      if (!response.ok) {
        setMessage(
          "Your authentication account was created, but your GoBiz profile could not be verified. Please contact the administrator before trying to register again."
        );
        return;
      }

      const profile = profileResult as UserProfile;

      if (
        profile.role === "ADMIN" &&
        profile.approval_status === "APPROVED"
      ) {
        setMessage(
          "Your GoBiz administrator account has been set up. You can now sign in."
        );
      } else {
        setMessage(
          "Your employee account was created. An administrator must approve your access before you can enter the workspace."
        );
      }

      setMode("signin");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isEmployeeSignup = mode === "employee";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7faf7] px-4 py-10 text-[#17211b]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-red-100/60 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#1f2937_1px,transparent_1px),linear-gradient(90deg,#1f2937_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <Link
        href="/"
        className="absolute left-5 top-5 z-10 rounded-full border border-gray-200 bg-white/85 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-green-300 hover:text-green-800"
      >
        ← Back to GoBiz
      </Link>

      <section className="relative z-10 w-full max-w-md">
        <header className="mb-7 text-center">
          <div className="mb-3 text-5xl font-black tracking-tight sm:text-6xl">
            <span className="text-green-700">Go</span>
            <span className="text-red-700">Biz</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
            Powered and designed by{" "}
            <span className="font-bold tracking-normal text-gray-800">
              DBC.creatives
            </span>
          </p>

          <p className="mx-auto mt-5 max-w-xs text-sm leading-6 text-gray-600">
            Good food. Fresh from the farm. Sign in to continue or register
            for the GoBiz team.
          </p>
        </header>

        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_22px_70px_-35px_rgba(22,101,52,0.28)] sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setMessage("");
                setError("");
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === "signin"
                  ? "bg-white text-green-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("employee");
                setMessage("");
                setError("");
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === "employee"
                  ? "bg-white text-green-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Employee sign up
            </button>
          </div>

          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEmployeeSignup ? "Join the GoBiz team" : "Welcome back"}
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              {isEmployeeSignup
                ? "Create an employee account. An administrator must approve access."
                : "Enter your details to sign in to your account."}
            </p>
          </div>

          {message && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-800"
            >
              {message}
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
            {isEmployeeSignup && (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
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
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isEmployeeSignup ? "new-password" : "current-password"
                  }
                  required
                  minLength={isEmployeeSignup ? 8 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isEmployeeSignup
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-3 text-xs font-semibold text-gray-500 hover:text-green-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {isEmployeeSignup && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    className="absolute inset-y-0 right-3 text-xs font-semibold text-gray-500 hover:text-green-800"
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-700/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isEmployeeSignup
                  ? "Create employee account"
                  : "Sign in"}
            </button>
          </form>

          {isEmployeeSignup && (
            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
              Employee accounts remain pending until approved by a GoBiz
              administrator.
            </p>
          )}
        </div>

        <footer className="mt-6 text-center text-xs text-gray-500">
          <span>GoBiz</span>
          <span className="mx-2 text-gray-300">•</span>
          <span>Meals and farm products</span>

          <div className="mt-2">
            <a
              href="https://dbc-pi-two.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-green-800"
            >
              DBC.creatives
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}