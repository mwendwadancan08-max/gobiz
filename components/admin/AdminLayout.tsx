"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Reviews & complaints", href: "/admin/reviews" },
  { label: "Delivery range", href: "/admin/range" },
  { label: "Meals & products", href: "/admin/meals" },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const pageTitle =
    navItems.find((item) => item.href === pathname)?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-[#17251d]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#10291f] text-white md:flex">
        <Link
          href="/admin"
          className="flex h-20 items-center border-b border-white/10 px-6"
        >
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-green-400">Go</span>
            <span className="text-red-400">Biz</span>
          </span>
          <span className="ml-3 text-xs text-white/60">
            Admin
          </span>
        </Link>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-5 text-xs text-white/45">
          GoBiz Food & Farm Market
        </div>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div>
            <p className="text-xs text-gray-500">GoBiz Admin</p>
            <h1 className="text-lg font-bold">{pageTitle}</h1>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10291f] text-sm font-bold text-white">
            AD
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-gray-200 px-6 py-5 text-center text-xs text-gray-500">
          GoBiz Food & Farm Market Admin
        </footer>
      </div>
    </div>
  );
}