
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

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
  latitude: number | null;
  longitude: number | null;
};

type TimeFilter = "TODAY" | "LAST_3" | "LAST_6" | "LAST_12" | "CUSTOM";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  ACCEPTED: "border-blue-200 bg-blue-50 text-blue-800",
  PREPARING: "border-purple-200 bg-purple-50 text-purple-800",
  READY: "border-cyan-200 bg-cyan-50 text-cyan-800",
  OUT_FOR_DELIVERY: "border-orange-200 bg-orange-50 text-orange-800",
  DELIVERED: "border-green-200 bg-green-50 text-green-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
};

function normalizeStatus(value: unknown): OrderStatus {
  const normalized = String(value ?? "").toUpperCase();

  return ORDER_STATUSES.includes(normalized as OrderStatus)
    ? (normalized as OrderStatus)
    : "PENDING";
}

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

function getMapsUrl(order: Order): string | null {
  const { latitude, longitude } = order;

  if (
    latitude == null ||
    longitude == null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function getTodayDateKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function getHourOptions() {
  return Array.from({ length: 24 }, (_, hour) => ({
    value: String(hour),
    label: `${String(hour).padStart(2, "0")}:00`,
  }));
}

function getHourRange(filter: TimeFilter, customStart: number, customEnd: number) {
  const now = new Date();
  const currentHour = now.getHours();

  if (filter === "TODAY") {
    return { start: 0, end: currentHour };
  }

  if (filter === "LAST_3") {
    return { start: Math.max(0, currentHour - 2), end: currentHour };
  }

  if (filter === "LAST_6") {
    return { start: Math.max(0, currentHour - 5), end: currentHour };
  }

  if (filter === "LAST_12") {
    return { start: Math.max(0, currentHour - 11), end: currentHour };
  }

  return { start: customStart, end: customEnd };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("TODAY");
  const [customStartHour, setCustomStartHour] = useState(0);
  const [customEndHour, setCustomEndHour] = useState(
    new Date().getHours()
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const knownOrderIds = useRef<Set<string> | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const updatingIds = useRef<Set<string>>(new Set());
  const soundSequence = useRef(0);

  const playNotification = useCallback(() => {
    if (!soundEnabledRef.current) return;

    try {
      if (!audioContext.current) {
        audioContext.current = new window.AudioContext();
      }

      const context = audioContext.current;
      const sequenceId = ++soundSequence.current;

      const playBeeps = async () => {
        try {
          if (context.state === "suspended") await context.resume();

          if (
            !soundEnabledRef.current ||
            sequenceId !== soundSequence.current
          ) {
            return;
          }

          const startTime = context.currentTime;
          const beepDuration = 0.22;
          const cycleDuration = 0.38;

          for (let i = 0; i < 5; i++) {
            const start = startTime + i * cycleDuration;
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(
              i % 2 === 0 ? 880 : 1175,
              start
            );

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.2, start + 0.025);
            gain.gain.setValueAtTime(0.2, start + beepDuration - 0.045);
            gain.gain.exponentialRampToValueAtTime(
              0.0001,
              start + beepDuration
            );

            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(start);
            oscillator.stop(start + beepDuration);

            oscillator.onended = () => {
              oscillator.disconnect();
              gain.disconnect();
            };
          }
        } catch (err) {
          console.error("Order notification sound failed:", err);
        }
      };

      void playBeeps();
    } catch (err) {
      console.error("Order notification sound failed:", err);
    }
  }, []);

  const refreshOrders = useCallback(
    async (manual = false) => {
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
            latitude: order.latitude == null ? null : Number(order.latitude),
            longitude:
              order.longitude == null ? null : Number(order.longitude),
            status: normalizeStatus(order.status),
          })
        );

        const fetchedIds = new Set(fetchedOrders.map((order) => order.id));

        if (knownOrderIds.current === null) {
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
    },
    [playNotification]
  );

  useEffect(() => {
    void refreshOrders();

    const interval = window.setInterval(() => {
      void refreshOrders();
    }, 10000);

    return () => {
      window.clearInterval(interval);
      soundSequence.current++;
      void audioContext.current?.close();
      audioContext.current = null;
    };
  }, [refreshOrders]);

  async function enableSound() {
    try {
      if (!audioContext.current) {
        audioContext.current = new window.AudioContext();
      }

      await audioContext.current.resume();
      soundEnabledRef.current = true;
      setSoundEnabled(true);
      setError("");
      playNotification();

      if (
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        void Notification.requestPermission();
      }
    } catch {
      setError("Allow sound in your browser settings and try again.");
    }
  }

  function disableSound() {
    soundEnabledRef.current = false;
    soundSequence.current++;
    setSoundEnabled(false);
  }

  async function updateStatus(id: string, status: OrderStatus) {
    if (updatingIds.current.has(id)) return;

    updatingIds.current.add(id);
    setUpdatingOrderId(id);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update order status.");
      }

      const savedStatus = normalizeStatus(data.order?.status ?? status);

      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status: savedStatus } : order
        )
      );

      setNotice(
        savedStatus === "DELIVERED"
          ? `Order ${data.order?.orderNumber ?? id} marked delivered and removed from this page. It remains available in Analytics.`
          : `Order ${data.order?.orderNumber ?? id} updated to ${statusLabels[savedStatus]}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update order."
      );
    } finally {
      updatingIds.current.delete(id);
      setUpdatingOrderId(null);
    }
  }

  const todayKey = getTodayDateKey();
  const hourRange = getHourRange(
    timeFilter,
    customStartHour,
    customEndHour
  );

  const query = search.trim().toLowerCase();

  // Delivered orders are deliberately excluded from this page.
  const visibleOrders = orders.filter((order) => order.status !== "DELIVERED");

  const filteredOrders = visibleOrders.filter((order) => {
    const created = new Date(order.createdAt);

    if (Number.isNaN(created.getTime())) return false;

    const orderDateKey = `${created.getFullYear()}-${String(
      created.getMonth() + 1
    ).padStart(2, "0")}-${String(created.getDate()).padStart(2, "0")}`;

    // All time filters are limited to today's orders.
    if (orderDateKey !== todayKey) return false;

    const orderHour = created.getHours();

    if (hourRange.start > hourRange.end) return false;
    if (orderHour < hourRange.start || orderHour > hourRange.end) return false;

    const itemNames = order.items.map((item) => item.name).join(" ");

    const matchesSearch = [
      order.orderNumber,
      order.customer,
      order.phone,
      order.email,
      order.deliveryAddress ?? "",
      order.buildingName ?? "",
      order.floor ?? "",
      order.deliveryNotes ?? "",
      itemNames,
    ].some((value) => value.toLowerCase().includes(query));

    return matchesSearch && (filter === "ALL" || order.status === filter);
  });

  const pendingCount = filteredOrders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const activeCount = filteredOrders.filter((order) =>
    ["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(
      order.status
    )
  ).length;

  const deliveryCount = filteredOrders.filter(
    (order) => order.fulfillmentMethod === "DELIVERY"
  ).length;

  const hourOptions = getHourOptions();

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#10291f]">Orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage today&apos;s orders, customer details, and fulfilment.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => (soundEnabled ? disableSound() : void enableSound())}
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

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-[#10291f]">Today&apos;s time period</h3>
            <p className="mt-1 text-sm text-gray-500">
              Filter orders by the hour they were placed. Delivered orders
              are kept in Analytics and hidden here.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["TODAY", "All today"],
                ["LAST_3", "Last 3 hours"],
                ["LAST_6", "Last 6 hours"],
                ["LAST_12", "Last 12 hours"],
                ["CUSTOM", "Custom hours"],
              ] as [TimeFilter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTimeFilter(value)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  timeFilter === value
                    ? "border-[#145a32] bg-[#145a32] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {timeFilter === "CUSTOM" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                From hour
                <select
                  value={customStartHour}
                  onChange={(event) =>
                    setCustomStartHour(Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 outline-none focus:border-green-700"
                >
                  {hourOptions.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700">
                To hour
                <select
                  value={customEndHour}
                  onChange={(event) =>
                    setCustomEndHour(Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 outline-none focus:border-green-700"
                >
                  {hourOptions.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
              </label>

              {customStartHour > customEndHour && (
                <p className="text-sm text-red-700 sm:col-span-2">
                  The start hour must be before or equal to the end hour.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="text-sm text-gray-500">Orders in period</p>
          <p className="mt-2 text-2xl font-bold text-[#10291f] sm:text-3xl">
            {filteredOrders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <p className="text-sm text-amber-800">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-800 sm:text-3xl">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
          <p className="text-sm text-blue-800">In progress</p>
          <p className="mt-2 text-2xl font-bold text-blue-800 sm:text-3xl">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 sm:p-5">
          <p className="text-sm text-green-800">Delivery orders</p>
          <p className="mt-2 text-2xl font-bold text-green-800 sm:text-3xl">
            {deliveryCount}
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
          placeholder="Search order, customer, phone, address or product..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
        />

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as "ALL" | OrderStatus)
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="ALL">All active statuses</option>
          {ORDER_STATUSES.filter((status) => status !== "DELIVERED").map(
            (status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            )
          )}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
          <h3 className="font-semibold text-gray-800">
            {visibleOrders.length === 0
              ? "No active orders"
              : "No orders in this time period"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try another time filter or refresh to check for new orders.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const mapsUrl = getMapsUrl(order);

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 bg-gray-50/80 p-4 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-[#10291f]">
                          {order.orderNumber}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                        >
                          {statusLabels[order.status]}
                        </span>

                        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                          {order.fulfillmentMethod === "DELIVERY"
                            ? "Delivery"
                            : "Pickup"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        Placed {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xl font-extrabold text-[#10291f]">
                        {formatPrice(order.amount)}
                      </p>

                      <select
                        aria-label={`Update status for order ${order.orderNumber}`}
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(event) =>
                          void updateStatus(
                            order.id,
                            event.target.value as OrderStatus
                          )
                        }
                        className="max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>

                      {updatingOrderId === order.id && (
                        <span className="text-xs text-gray-500">Saving...</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Customer details
                    </h4>

                    <p className="mt-3 font-semibold text-gray-900">
                      {order.customer}
                    </p>

                    <a
                      href={`tel:${order.phone}`}
                      className="mt-1 inline-block text-sm font-medium text-green-800 underline underline-offset-2"
                    >
                      {order.phone}
                    </a>

                    {order.email && (
                      <p className="mt-1 break-all text-sm text-gray-600">
                        {order.email}
                      </p>
                    )}
                  </section>

                  <section className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Delivery location
                      </h4>

                      {order.fulfillmentMethod === "DELIVERY" && mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg bg-[#145a32] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0e4525]"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </div>

                    {order.fulfillmentMethod === "PICKUP" ? (
                      <p className="mt-3 text-sm text-gray-600">
                        Customer will collect the order.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <p>
                          <span className="font-semibold">Area/address:</span>{" "}
                          {order.deliveryAddress || "Not provided"}
                        </p>

                        {order.buildingName && (
                          <p>
                            <span className="font-semibold">
                              Building/plot:
                            </span>{" "}
                            {order.buildingName}
                          </p>
                        )}

                        {order.floor && (
                          <p>
                            <span className="font-semibold">Floor:</span>{" "}
                            {order.floor}
                          </p>
                        )}

                        {order.deliveryNotes && (
                          <p>
                            <span className="font-semibold">
                              Delivery notes:
                            </span>{" "}
                            {order.deliveryNotes}
                          </p>
                        )}

                        {!mapsUrl && (
                          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            GPS coordinates are unavailable for this order.
                            Use the written address to contact the customer.
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                </div>

                <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Items ordered ({order.items.length})
                  </h4>

                  <div className="mt-3 divide-y divide-gray-100">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${item.name}-${index}`}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="text-gray-700">
                          {item.name}{" "}
                          <span className="font-semibold text-gray-500">
                            × {item.quantity}
                          </span>
                        </span>

                        <span className="font-semibold text-gray-900">
                          {formatPrice(Number(item.lineTotal))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Orders refresh automatically every 10 seconds. Mark an order as
        Delivered when fulfilment is complete; it will disappear from this
        page while remaining available in Analytics. Time filters use your
        browser&apos;s local time.
      </p>
    </section>
  );
}
