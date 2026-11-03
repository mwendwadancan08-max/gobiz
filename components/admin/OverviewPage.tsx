
"use client";

import { useCallback, useEffect, useState } from "react";

type Order = {
  id: string;
  status: string;
  amount: number;
};

type Product = {
  id: string;
  name: string;
};

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedSales: number;
  products: number;
};

const initialStats: DashboardStats = {
  totalOrders: 0,
  pendingOrders: 0,
  completedSales: 0,
  products: 0,
};

export default function OverviewPage() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);

      if (!ordersResponse.ok || !productsResponse.ok) {
        throw new Error("Unable to load dashboard information.");
      }

      const [ordersData, productsData] = await Promise.all([
        ordersResponse.json(),
        productsResponse.json(),
      ]);

      const orders: Order[] = ordersData.orders || [];
      const products: Product[] = productsData.products || [];

      const completedSales = orders
        .filter((order) => order.status === "DELIVERED")
        .reduce((total, order) => total + Number(order.amount || 0), 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(
          (order) => order.status === "PENDING"
        ).length,
        completedSales,
        products: products.length,
      });
    } catch (err) {
      console.error("Admin dashboard loading failed:", err);
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
      value: stats.totalOrders.toLocaleString(),
      href: "/admin/orders",
    },
    {
      label: "Pending orders",
      value: stats.pendingOrders.toLocaleString(),
      href: "/admin/orders",
    },
    {
      label: "Completed sales",
      value: `KSh ${stats.completedSales.toLocaleString("en-KE")}`,
      href: "/admin/orders",
    },
    {
      label: "Meals & products",
      value: stats.products.toLocaleString(),
      href: "/admin/products",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#10291f]">
            Dashboard overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Welcome to your GoBiz administration dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#10291f] shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
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
              {loading ? "..." : stat.value}
            </p>
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#10291f]">
          Getting started
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Use the sidebar to manage orders, review analytics, respond to
          customer feedback, configure delivery range, manage meals
          and farm products, and control employee access.
        </p>
      </div>
    </section>
  );
}
