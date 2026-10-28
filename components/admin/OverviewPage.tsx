"use client";

export default function OverviewPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#10291f]">
          Dashboard overview
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your GoBiz administration dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total orders", value: "0" },
          { label: "Pending orders", value: "0" },
          { label: "Completed sales", value: "KSh 0" },
          { label: "Meals & products", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-3 text-2xl font-bold text-[#10291f]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#10291f]">
          Getting started
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Use the sidebar to manage orders, review analytics, respond to
          customer feedback, configure delivery range, and manage meals
          and farm products.
        </p>
      </div>
    </section>
  );
}