
"use client";

export default function AnalyticsPage() {
  const metrics = [
    { label: "Total orders", value: "0" },
    { label: "Completed orders", value: "0" },
    { label: "Pending orders", value: "0" },
    { label: "Total sales", value: "KSh 0" },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#10291f]">Analytics</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor sales and order performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-bold text-[#10291f]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="font-bold text-[#10291f]">Sales performance</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Analytics will display actual sales trends when connected to
          your order database. No sales data is currently loaded here.
        </p>
      </div>
    </section>
  );
}
