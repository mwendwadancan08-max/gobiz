
"use client";

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

      // Count feedback submitted today using the visitor's local date.
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

  const statCards = [
    {
      label: "Total orders",
      value: stats.totalOrders,
      href: "/employee/orders",
    },
    {
      label: "Pending orders",
      value: stats.pendingOrders,
      href: "/employee/orders",
    },
    {
      label: "Available products",
      value: stats.availableProducts,
      href: "/employee/products",
    },
    {
      label: "Today's feedback",
      value: stats.todaysFeedback,
      href: "/employee/feedback",
    },
  ];

  return (
    <section className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#10291f]">
            Employee overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome to your GoBiz workspace. Manage daily operations from here.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#10291f] shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#10291f]"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>

            <p className="mt-3 text-2xl font-bold text-[#10291f]">
              {loading ? "..." : stat.value.toLocaleString()}
            </p>
          </a>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[#10291f]">
          Your workspace
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Orders",
              description:
                "View customer orders and update their progress.",
              href: "/employee/orders",
            },
            {
              title: "Meals & Products",
              description:
                "Manage meals, fresh produce and product listings.",
              href: "/employee/products",
            },
            {
              title: "Reviews & Feedback",
              description:
                "Read customer reviews and feedback submitted by customers.",
              href: "/employee/feedback",
            },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#10291f]"
            >
              <h3 className="font-bold text-[#10291f]">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {item.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-[#10291f]">
                Open page →
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
