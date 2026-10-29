
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

type OrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  email: string;
  items: OrderItem[];
  amount: number;
  status: OrderStatus;
  createdAt: string;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  buildingName: string | null;
  floor: string | null;
  deliveryNotes: string | null;
};

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatPrice(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const knownOrderIds = useRef<Set<string> | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const updatingIds = useRef<Set<string>>(new Set());

  const playNotification = useCallback(() => {
    if (!soundEnabledRef.current) return;

    try {
      const AudioContextClass = window.AudioContext;

      if (!AudioContextClass) return;

      if (!audioContext.current) {
        audioContext.current = new AudioContextClass();
      }

      const context = audioContext.current;

      if (context.state === "suspended") {
        void context.resume();
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.setValueAtTime(
        1175,
        context.currentTime + 0.14
      );

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.18,
        context.currentTime + 0.025
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.38
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.4);
    } catch (err) {
      console.error("Order notification sound failed:", err);
    }
  }, []);

  const refreshOrders = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load orders.");
      }

      const fetchedOrders: Order[] = (data.orders ?? []).map(
        (order: Order) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
          amount: Number(order.amount),
          status: String(order.status).toUpperCase() as OrderStatus,
        })
      );

      const fetchedIds = new Set(
        fetchedOrders.map((order) => order.id)
      );

      if (knownOrderIds.current === null) {
        // Establish the initial baseline without sounding for old orders.
        knownOrderIds.current = fetchedIds;
      } else {
        const newOrders = fetchedOrders.filter(
          (order) => !knownOrderIds.current!.has(order.id)
        );

        if (newOrders.length > 0) {
          playNotification();

          setNotice(
            newOrders.length === 1
              ? `New order received: ${newOrders[0].orderNumber}`
              : `${newOrders.length} new orders received.`
          );

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New GoBiz order", {
              body:
                newOrders.length === 1
                  ? `Order ${newOrders[0].orderNumber} has been placed.`
                  : `${newOrders.length} new orders have been placed.`,
            });
          }
        }

        knownOrderIds.current = new Set([
          ...knownOrderIds.current,
          ...fetchedIds,
        ]);
      }

      setOrders(fetchedOrders);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [playNotification]);

  useEffect(() => {
    void refreshOrders();

    const interval = window.setInterval(() => {
      void refreshOrders();
    }, 10000);

    return () => {
      window.clearInterval(interval);
      void audioContext.current?.close();
    };
  }, [refreshOrders]);

  async function enableSound() {
    try {
      const AudioContextClass = window.AudioContext;

      if (!AudioContextClass) {
        setError("Audio notifications are not supported by this browser.");
        return;
      }

      if (!audioContext.current) {
        audioContext.current = new AudioContextClass();
      }

      await audioContext.current.resume();

      soundEnabledRef.current = true;
      setSoundEnabled(true);
      setError("");

      // Short test tone confirms the sound is enabled.
      playNotification();

      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission();
      }
    } catch {
      setError("Allow sound in your browser settings and try again.");
    }
  }

  function disableSound() {
    soundEnabledRef.current = false;
    setSoundEnabled(false);
  }

  async function updateStatus(id: string, status: OrderStatus) {
    if (updatingIds.current.has(id)) return;

    updatingIds.current.add(id);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update order status.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );

      setNotice(`Order ${data.order.orderNumber} updated successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update order."
      );
    } finally {
      updatingIds.current.delete(id);
    }
  }

  const query = search.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    const itemNames = order.items
      .map((item) => item.name)
      .join(" ");

    const matchesSearch = [
      order.orderNumber,
      order.customer,
      order.phone,
      order.email,
      itemNames,
    ].some((value) => value.toLowerCase().includes(query));

    return (
      matchesSearch &&
      (filter === "ALL" || order.status === filter)
    );
  });

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#10291f]">
            Orders
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View customer orders, manage fulfilment, and track payments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (soundEnabled) {
                disableSound();
              } else {
                void enableSound();
              }
            }}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
              soundEnabled
                ? "border-green-700 bg-green-50 text-green-800"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            {soundEnabled ? "Sound notifications: On" : "Enable order sound"}
          </button>

          <button
            type="button"
            onClick={() => void refreshOrders(true)}
            disabled={refreshing}
            className="rounded-xl bg-[#145a32] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh orders"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total orders</p>
          <p className="mt-2 text-3xl font-bold text-[#10291f]">
            {orders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending orders</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Completed orders</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {orders.filter((order) => order.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, customer, phone or product..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
        />

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as "ALL" | OrderStatus)
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="font-semibold text-gray-800">
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              New customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <article key={order.id} className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-[#10291f]">
                        {order.orderNumber}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status.charAt(0) +
                          order.status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-[#10291f]">
                      {formatPrice(order.amount)}
                    </p>

                    <select
                      aria-label={`Update status for order ${order.orderNumber}`}
                      value={order.status}
                      disabled={updatingIds.current.has(order.id)}
                      onChange={(event) =>
                        void updateStatus(
                          order.id,
                          event.target.value as OrderStatus
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </h4>
                    <p className="mt-2 font-semibold text-gray-900">
                      {order.customer}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.phone}
                    </p>
                    <p className="mt-1 break-all text-sm text-gray-600">
                      {order.email}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Fulfilment
                    </h4>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {order.fulfillmentMethod === "DELIVERY"
                        ? "Delivery"
                        : "Pickup"}
                    </p>

                    {order.deliveryAddress && (
                      <p className="mt-1 text-sm text-gray-600">
                        Area: {order.deliveryAddress}
                      </p>
                    )}

                    {order.buildingName && (
                      <p className="mt-1 text-sm text-gray-600">
                        Plot/building: {order.buildingName}
                      </p>
                    )}

                    {order.floor && (
                      <p className="mt-1 text-sm text-gray-600">
                        Floor: {order.floor}
                      </p>
                    )}

                    {order.deliveryNotes && (
                      <p className="mt-1 text-sm text-gray-600">
                        {order.deliveryNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Items ordered
                  </h4>

                  <div className="mt-3 space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${item.name}-${index}`}
                        className="flex flex-wrap justify-between gap-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(Number(item.lineTotal))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Orders refresh automatically every 10 seconds while this page is open.
        Keep this page open and enable sound to hear new-order alerts.
      </p>
    </section>
  );
}
