"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/employee", icon: "⌂" },
  { label: "Orders", href: "/employee/orders", icon: "▤" },
  { label: "Meals & Products", href: "/employee/products", icon: "▦" },
  { label: "Reviews & Feedback", href: "/employee/feedback", icon: "✉" },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [checking, setChecking] = useState(true);
  const [employeeName, setEmployeeName] = useState("Employee");

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function verifyEmployee() {
      try {
        const response = await fetch("/api/auth/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/signin");
          return;
        }

        const profile = await response.json();

        if (
          profile.role !== "EMPLOYEE" ||
          profile.approval_status !== "APPROVED"
        ) {
          router.replace("/signin");
          return;
        }

        if (active) {
          setEmployeeName(profile.full_name || "Employee");
          setChecking(false);
        }
      } catch {
        router.replace("/signin");
      }
    }

    verifyEmployee();

    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
          <p className="text-sm font-medium text-neutral-500">
            Verifying employee access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-xl text-neutral-800 transition hover:border-green-700 hover:bg-green-50 hover:text-green-800"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "☰" : "☰"}
          </button>

          <Link href="/employee" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
              <span className="text-green-700">Go</span>
              <span className="text-red-700">Biz</span>
            </span>
            <span className="hidden rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-green-800 sm:inline">
              Employee
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-neutral-500 sm:inline">
            Signed in as
          </span>
          <span className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-red-700 text-[11px] font-bold text-white">
              {employeeName.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[120px] truncate text-xs font-semibold text-neutral-800 sm:max-w-none">
              {employeeName}
            </span>
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-30 w-64 border-r border-neutral-200 bg-white transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Employee workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/employee" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setMenuOpen(false);
                    }
                  }}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-green-800 to-green-700 text-white shadow-md shadow-green-900/20"
                      : "text-neutral-600 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-red-600"
                    />
                  )}
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-neutral-100 text-neutral-700 group-hover:bg-green-100 group-hover:text-green-800"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-neutral-200 bg-gradient-to-br from-green-50 to-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-800">
              GoBiz
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Meals and farm products in one place.
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-green-800 hover:text-green-900"
            >
              Back to store
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-16 z-20 bg-black/30 backdrop-blur-sm md:hidden"
        />
      )}

      <main
        className={`min-h-screen pt-16 transition-all duration-300 ${
          menuOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        <div className="p-4 sm:p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}