"use client";

import { useMemo, useState } from "react";

type OrderStatus = "Pending" | "Completed" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  items: string;
  amount: number;
  status: OrderStatus;
  time: string;
};

const initialOrders: Order[] = [];

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.items.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (filter === "All" || order.status === filter)
      );
    });
  }, [orders, search, filter]);

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#10291f]">
          Orders
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          View and manage customer orders.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer or item..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
        />

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as "All" | OrderStatus)
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {filteredOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-semibold text-gray-800">
              No orders found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Orders will appear here when connected to your order data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Items</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-semibold">{order.id}</td>
                    <td className="px-5 py-4">{order.customer}</td>
                    <td className="px-5 py-4">{order.items}</td>
                    <td className="px-5 py-4">
                      KSh {order.amount.toLocaleString("en-KE")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        aria-label={`Update status for order ${order.id}`}
                        value={order.status}
                        onChange={(event) =>
                          updateStatus(order.id, event.target.value as OrderStatus)
                        }
                        className="rounded-lg border border-gray-200 px-2 py-2"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}