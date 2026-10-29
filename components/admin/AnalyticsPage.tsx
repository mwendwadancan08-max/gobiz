
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type AnalyticsOrder = {
  id: string;
  orderNumber?: string;
  amount: number;
  status: string;
  createdAt: string;
};

type Period = "TODAY" | "7D" | "30D" | "MONTH" | "ALL" | "CUSTOM";

type SalesBucket = {
  key: string;
  label: string;
  sales: number;
  orders: number;
};

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string, endOfDay = false) {
  if (!value) return null;

  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPrice(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getPeriodDates(period: Period) {
  const today = new Date();
  const todayKey = localDateKey(today);

  if (period === "ALL") {
    return { start: "", end: todayKey };
  }

  if (period === "CUSTOM") {
    return { start: todayKey, end: todayKey };
  }

  if (period === "TODAY") {
    return { start: todayKey, end: todayKey };
  }

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  if (period === "7D") {
    start.setDate(start.getDate() - 6);
  } else if (period === "30D") {
    start.setDate(start.getDate() - 29);
  } else if (period === "MONTH") {
    start.setDate(1);
  }

  return { start: localDateKey(start), end: todayKey };
}

export default function AnalyticsPage() {
  const initialPeriod = getPeriodDates("7D");

  const [orders, setOrders] = useState<AnalyticsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [period, setPeriod] = useState<Period>("7D");
  const [startDate, setStartDate] = useState(initialPeriod.start);
  const [endDate, setEndDate] = useState(initialPeriod.end);

  const fetchAnalytics = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load analytics.");
      }

      const fetchedOrders: AnalyticsOrder[] = (
        Array.isArray(data.orders) ? data.orders : []
      ).map((order: AnalyticsOrder) => ({
        ...order,
        amount: Number(order.amount) || 0,
        status: String(order.status ?? "PENDING").toUpperCase(),
      }));

      setOrders(fetchedOrders);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();

    const interval = window.setInterval(() => {
      void fetchAnalytics();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [fetchAnalytics]);

  function selectPeriod(nextPeriod: Period) {
    setPeriod(nextPeriod);

    const dates = getPeriodDates(nextPeriod);
    setStartDate(dates.start);
    setEndDate(dates.end);
  }

  const filteredOrders = useMemo(() => {
    const start = startDate ? parseLocalDate(startDate) : null;
    const end = endDate ? parseLocalDate(endDate, true) : null;

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);

      if (Number.isNaN(createdAt.getTime())) return false;
      if (start && createdAt < start) return false;
      if (end && createdAt > end) return false;

      return true;
    });
  }, [orders, startDate, endDate]);

  const completedOrders = filteredOrders.filter(
    (order) => order.status === "DELIVERED"
  );

  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "PENDING"
  );

  const activeOrders = filteredOrders.filter((order) =>
    ["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(
      order.status
    )
  );

  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "CANCELLED"
  );

  const totalSales = completedOrders.reduce(
    (sum, order) => sum + order.amount,
    0
  );

  const averageOrderValue =
    completedOrders.length > 0
      ? totalSales / completedOrders.length
      : 0;

  const salesBuckets = useMemo(() => {
    const validDates = filteredOrders
      .map((order) => new Date(order.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()));

    const rangeStart = startDate
      ? parseLocalDate(startDate)
      : validDates.length
        ? new Date(
            Math.min(...validDates.map((date) => date.getTime()))
          )
        : new Date();

    const rangeEnd = endDate
      ? parseLocalDate(endDate)
      : new Date();

    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
      return [] as SalesBucket[];
    }

    const start = new Date(rangeStart);
    start.setHours(0, 0, 0, 0);

    const end = new Date(rangeEnd);
    end.setHours(0, 0, 0, 0);

    const totalDays =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    // Daily buckets for shorter ranges; weekly buckets for longer ranges.
    const useWeekly = totalDays > 31;
    const buckets: SalesBucket[] = [];

    const cursor = new Date(start);

    while (cursor <= end) {
      const bucketStart = new Date(cursor);
      const bucketEnd = new Date(cursor);

      if (useWeekly) {
        bucketEnd.setDate(bucketEnd.getDate() + 6);
        if (bucketEnd > end) {
          bucketEnd.setTime(end.getTime());
        }
      }

      const key = localDateKey(bucketStart);
      const endKey = localDateKey(bucketEnd);

      const bucketOrders = completedOrders.filter((order) => {
        const date = new Date(order.createdAt);
        if (Number.isNaN(date.getTime())) return false;

        const dateKey = localDateKey(date);

        return dateKey >= key && dateKey <= endKey;
      });

      buckets.push({
        key,
        label: useWeekly
          ? `${bucketStart.toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
            })}`
          : bucketStart.toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
            }),
        sales: bucketOrders.reduce(
          (sum, order) => sum + order.amount,
          0
        ),
        orders: bucketOrders.length,
      });

      cursor.setDate(cursor.getDate() + (useWeekly ? 7 : 1));
    }

    // Keep the chart readable for very long custom ranges.
    return buckets.length > 90
      ? buckets.filter((_, index) => index % Math.ceil(buckets.length / 90) === 0)
      : buckets;
  }, [filteredOrders, completedOrders, startDate, endDate]);

  const highestSales = Math.max(
    ...salesBuckets.map((bucket) => bucket.sales),
    0
  );

  const metrics = [
    {
      label: "Total orders",
      value: filteredOrders.length.toLocaleString("en-KE"),
      description: "Orders in selected period",
      style: "border-gray-200",
    },
    {
      label: "Completed orders",
      value: completedOrders.length.toLocaleString("en-KE"),
      description: "Successfully delivered",
      style: "border-green-200",
    },
    {
      label: "Pending orders",
      value: pendingOrders.length.toLocaleString("en-KE"),
      description: "Awaiting acceptance",
      style: "border-amber-200",
    },
    {
      label: "Total sales",
      value: formatPrice(totalSales),
      description: "Delivered orders only",
      style: "border-red-200",
    },
  ];

  const invalidRange =
    Boolean(startDate && endDate && startDate > endDate);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#10291f]">
            Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor sales and order performance for any period.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-gray-400">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString("en-KE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void fetchAnalytics(true)}
          disabled={refreshing}
          className="rounded-xl bg-[#145a32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e4525] disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh analytics"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h3 className="font-bold text-[#10291f]">
          Select reporting period
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose a preset or set your own dates.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["TODAY", "Today"],
              ["7D", "Last 7 days"],
              ["30D", "Last 30 days"],
              ["MONTH", "This month"],
              ["ALL", "All time"],
              ["CUSTOM", "Custom range"],
            ] as [Period, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => selectPeriod(value)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                period === value
                  ? "border-[#145a32] bg-[#145a32] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-green-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPeriod("CUSTOM");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              End date
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              max={localDateKey(new Date())}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPeriod("CUSTOM");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
            />
          </label>
        </div>

        {invalidRange && (
          <p className="mt-3 text-sm text-red-700">
            The start date must be on or before the end date.
          </p>
        )}

        {!invalidRange && (
          <p className="mt-3 text-xs text-gray-400">
            Showing{" "}
            {startDate
              ? formatDate(startDate)
              : "the earliest available order"}{" "}
            through{" "}
            {endDate ? formatDate(endDate) : "today"}.
          </p>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
          Loading live analytics...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={`rounded-2xl border ${metric.style} bg-white p-5`}
              >
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="mt-3 break-words text-2xl font-bold text-[#10291f]">
                  {invalidRange ? "—" : metric.value}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Orders in progress</p>
              <p className="mt-2 text-2xl font-bold text-blue-800">
                {invalidRange ? "—" : activeOrders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">
                Average completed order
              </p>
              <p className="mt-2 text-2xl font-bold text-[#10291f]">
                {invalidRange ? "—" : formatPrice(averageOrderValue)}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Cancelled orders</p>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {invalidRange ? "—" : cancelledOrders.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <h3 className="font-bold text-[#10291f]">
                  Sales performance
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {period === "ALL"
                    ? "Sales across all available order history."
                    : "Sales within your selected date range."}
                </p>
              </div>

              <span className="text-sm font-semibold text-green-800">
                {invalidRange
                  ? "—"
                  : formatPrice(
                      salesBuckets.reduce(
                        (sum, bucket) => sum + bucket.sales,
                        0
                      )
                    )}
              </span>
            </div>

            {invalidRange ? (
              <p className="mt-6 text-sm text-gray-500">
                Choose a valid date range to view sales.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-7 lg:grid-cols-10">
                {salesBuckets.map((bucket) => {
                  const height =
                    highestSales > 0
                      ? (bucket.sales / highestSales) * 100
                      : 0;

                  return (
                    <div
                      key={bucket.key}
                      className="flex min-w-0 flex-col items-center"
                      title={`${bucket.label}: ${formatPrice(
                        bucket.sales
                      )}, ${bucket.orders} delivered orders`}
                    >
                      <p className="mb-2 min-h-8 text-center text-[10px] font-medium text-gray-500">
                        {bucket.sales > 0
                          ? formatPrice(bucket.sales)
                          : "—"}
                      </p>

                      <div className="flex h-36 w-full items-end justify-center rounded-lg bg-gray-50 px-1">
                        <div
                          className="w-full max-w-12 rounded-t-md bg-[#145a32] transition-all duration-500"
                          style={{
                            height: `${height}%`,
                            minHeight: bucket.sales > 0 ? "6px" : "0",
                          }}
                        />
                      </div>

                      <p className="mt-2 text-center text-[10px] font-semibold text-gray-600">
                        {bucket.label}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {bucket.orders} orders
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {!invalidRange && completedOrders.length === 0 && (
              <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                No delivered orders were found in this period.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-[#10291f]">
                  Orders in selected period
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  The 10 most recent orders matching your dates.
                </p>
              </div>
              <p className="text-xs text-gray-400">
                {invalidRange ? "—" : `${filteredOrders.length} orders`}
              </p>
            </div>

            {invalidRange ? (
              <p className="mt-5 text-sm text-gray-500">
                Choose a valid date range.
              </p>
            ) : filteredOrders.length === 0 ? (
              <p className="mt-5 rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No orders found for this period.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-3 pr-4 font-semibold">Order</th>
                      <th className="py-3 pr-4 font-semibold">Date</th>
                      <th className="py-3 pr-4 font-semibold">Status</th>
                      <th className="py-3 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {[...filteredOrders]
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .slice(0, 10)
                      .map((order) => {
                        const status = order.status;
                        const statusStyle =
                          status === "DELIVERED"
                            ? "bg-green-50 text-green-800"
                            : status === "CANCELLED"
                              ? "bg-red-50 text-red-800"
                              : status === "PENDING"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-blue-50 text-blue-800";

                        return (
                          <tr key={order.id}>
                            <td className="py-4 pr-4 font-semibold text-[#10291f]">
                              {order.orderNumber || order.id}
                            </td>
                            <td className="py-4 pr-4 text-gray-500">
                              {formatDateTime(order.createdAt)}
                            </td>
                            <td className="py-4 pr-4">
                              <span
                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle}`}
                              >
                                {status.replaceAll("_", " ")}
                              </span>
                            </td>
                            <td className="py-4 text-right font-semibold text-gray-800">
                              {formatPrice(order.amount)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Analytics refresh automatically every 10 seconds. Sales include
            only orders marked DELIVERED. The chart uses order creation dates,
            not a separate delivery-completion date.
          </p>
        </>
      )}
    </section>
  );
}
