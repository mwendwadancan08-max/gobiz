"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
};

type Product = {
  id: string;
  name: string;
};

type Feedback = {
  id: string;
  created_at: string;
};

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  availableProducts: number;
  todaysFeedback: number;
};

const initialStats: DashboardStats = {
  totalOrders: 0,
  pendingOrders: 0,
  availableProducts: 0,
  todaysFeedback: 0,
};

type StatCard = {
  label: string;
  value: number;
  href: string;
  accent: "green" | "red" | "black";
  icon: React.ReactNode;
};

type WorkspaceCard = {
  title: string;
  description: string;
  href: string;
  accent: "green" | "red" | "black";
  icon: React.ReactNode;
};

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M20 7l-8-4-8 4 8 4 8-4z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
      <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
    </svg>
  );
}

export default function EmployeeOverviewPage() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersResponse, productsResponse, feedbackResponse] =
        await Promise.all([
          fetch("/api/orders", { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/admin/feedback", { cache: "no-store" }),
        ]);

      if (
        !ordersResponse.ok ||
        !productsResponse.ok ||
        !feedbackResponse.ok
      ) {
        throw new Error("Unable to load dashboard information.");
      }

      const [ordersData, productsData, feedbackData] =
        await Promise.all([
          ordersResponse.json(),
          productsResponse.json(),
          feedbackResponse.json(),
        ]);

      const orders: Order[] = ordersData.orders || [];
      const products: Product[] = productsData.products || [];
      const feedback: Feedback[] = feedbackData.feedback || [];

      const now = new Date();

      const todaysFeedback = feedback.filter((item) => {
        const date = new Date(item.created_at);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        );
      }).length;

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(
          (order) => order.status === "PENDING"
        ).length,
        availableProducts: products.length,
        todaysFeedback,
      });
    } catch (err) {
      console.error("Employee dashboard loading failed:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards: StatCard[] = [
    {
      label: "Total orders",
      value: stats.totalOrders,
      href: "/employee/orders",
      accent: "green",
      icon: <OrdersIcon />,
    },
    {
      label: "Pending orders",
      value: stats.pendingOrders,
      href: "/employee/orders",
      accent: "red",
      icon: <PendingIcon />,
    },
    {
      label: "Available products",
      value: stats.availableProducts,
      href: "/employee/products",
      accent: "black",
      icon: <ProductsIcon />,
    },
    {
      label: "Today's feedback",
      value: stats.todaysFeedback,
      href: "/employee/feedback",
      accent: "green",
      icon: <FeedbackIcon />,
    },
  ];

  const workspaceCards: WorkspaceCard[] = [
    {
      title: "Orders",
      description: "View customer orders and update their progress.",
      href: "/employee/orders",
      accent: "green",
      icon: <OrdersIcon />,
    },
    {
      title: "Meals & Products",
      description: "Manage meals, fresh produce and product listings.",
      href: "/employee/products",
      accent: "red",
      icon: <ProductsIcon />,
    },
    {
      title: "Reviews & Feedback",
      description:
        "Read customer reviews and feedback submitted by customers.",
      href: "/employee/feedback",
      accent: "black",
      icon: <FeedbackIcon />,
    },
  ];

  const accentStyles = {
    green: {
      chip: "bg-gradient-to-br from-green-700 to-green-500",
      ring: "hover:border-green-500",
      glow: "bg-green-200",
      text: "text-green-700",
    },
    red: {
      chip: "bg-gradient-to-br from-red-800 to-red-600",
      ring: "hover:border-red-500",
      glow: "bg-red-200",
      text: "text-red-700",
    },
    black: {
      chip: "bg-gradient-to-br from-neutral-900 to-neutral-700",
      ring: "hover:border-neutral-900",
      glow: "bg-neutral-200",
      text: "text-neutral-900",
    },
  } as const;

  return (
    <section className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Workspace
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
            <span className="text-green-700">Go</span>
            <span className="text-red-700">Biz</span>{" "}
            <span className="text-neutral-900">overview</span>
          </h1>

          <p className="mt-1 text-sm text-neutral-600">
            Welcome back. Manage daily operations from here.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-green-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshIcon />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const a = accentStyles[stat.accent];

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${a.ring}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${a.glow} opacity-0 blur-3xl transition group-hover:opacity-60`}
              />

              <div className="relative flex items-start justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.chip} text-white shadow-md transition group-hover:scale-105`}
                >
                  {stat.icon}
                </span>
              </div>

              <p className="relative mt-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
                {stat.label}
              </p>

              <p className={`relative mt-1 text-3xl font-extrabold tracking-tight ${a.text}`}>
                {loading ? "…" : stat.value.toLocaleString()}
              </p>

              <p className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition group-hover:text-neutral-900">
                Open
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </p>
            </Link>
          );
        })}
      </div>

      {/* Workspace cards */}
      <div>
        <h2 className="mb-4 text-lg font-extrabold tracking-tight text-neutral-900">
          Your workspace
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {workspaceCards.map((item) => {
            const a = accentStyles[item.accent];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${a.ring}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${a.glow} opacity-0 blur-3xl transition group-hover:opacity-50`}
                />

                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${a.chip} text-white shadow-md transition group-hover:scale-105`}
                >
                  {item.icon}
                </span>

                <h3 className="relative mt-4 text-base font-extrabold text-neutral-900">
                  {item.title}
                </h3>

                <p className="relative mt-2 text-sm leading-6 text-neutral-600">
                  {item.description}
                </p>

                <p className={`relative mt-5 inline-flex items-center gap-1 text-sm font-bold ${a.text}`}>
                  Open page
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}