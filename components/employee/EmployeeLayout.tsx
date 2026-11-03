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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Verifying employee access...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-2xl hover:bg-gray-100"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "☰" : "☰"}
          </button>

          <Link
            href="/employee"
            className="text-xl font-extrabold tracking-tight text-[#10291f]"
          >
            GoBiz
            <span className="ml-2 text-xs font-medium text-gray-400">
              EMPLOYEE
            </span>
          </Link>
        </div>

        <p className="text-sm font-medium text-gray-600">
          {employeeName}
        </p>
      </header>

      <aside
        className={`fixed bottom-0 left-0 top-16 z-30 w-64 border-r border-gray-200 bg-white transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Employee workspace
          </p>

          <nav className="space-y-2">
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
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#10291f] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-16 z-20 bg-black/20 md:hidden"
        />
      )}

      <main
        className={`min-h-screen pt-16 transition-all duration-300 ${
          menuOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}