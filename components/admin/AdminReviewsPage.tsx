
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type FeedbackType = "COMPLAINT" | "SUGGESTION";

type Feedback = {
  id: string | number;
  feedback_type: FeedbackType;
  is_anonymous: boolean;
  customer_name: string | null;
  phone: string | null;
  message: string;
  created_at: string;
};

function TypeBadge({ type }: { type: FeedbackType }) {
  const complaint = type === "COMPLAINT";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        complaint
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {complaint ? "Complaint" : "Suggestion"}
    </span>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl font-semibold text-emerald-800">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminReviewsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | FeedbackType>("ALL");
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/feedback", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load customer feedback.");
      }

      setFeedback(Array.isArray(data.feedback) ? data.feedback : []);
      setLastUpdated(
        new Intl.DateTimeFormat("en-KE", {
          timeStyle: "short",
        }).format(new Date())
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load customer feedback."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const complaints = feedback.filter(
    (item) => item.feedback_type === "COMPLAINT"
  );

  const suggestions = feedback.filter(
    (item) => item.feedback_type === "SUGGESTION"
  );

  const filteredFeedback = useMemo(() => {
    const term = search.trim().toLowerCase();

    return feedback.filter((item) => {
      const matchesTab =
        activeTab === "ALL" || item.feedback_type === activeTab;

      const matchesSearch =
        !term ||
        item.message.toLowerCase().includes(term) ||
        (item.customer_name ?? "").toLowerCase().includes(term) ||
        (item.phone ?? "").toLowerCase().includes(term) ||
        String(item.id).toLowerCase().includes(term);

      return matchesTab && matchesSearch;
    });
  }, [feedback, activeTab, search]);

  return (
    <section className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Customer experience
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reviews & complaints
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review customer suggestions and identify service issues.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadFeedback()}
          disabled={loading}
          className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh feedback"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total feedback"
          value={String(feedback.length)}
          note="All submitted customer feedback"
          icon="◉"
        />
        <StatCard
          label="Complaints"
          value={String(complaints.length)}
          note="Customer issues requiring attention"
          icon="!"
        />
        <StatCard
          label="Suggestions"
          value={String(suggestions.length)}
          note="Ideas shared by customers"
          icon="↗"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Customer feedback
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredFeedback.length} submission(s) shown
              {lastUpdated ? ` · Updated ${lastUpdated}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "All feedback", value: "ALL" },
              { label: "Complaints", value: "COMPLAINT" },
              { label: "Suggestions", value: "SUGGESTION" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  setActiveTab(tab.value as "ALL" | FeedbackType)
                }
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold sm:px-4 sm:text-sm ${
                  activeTab === tab.value
                    ? "bg-emerald-800 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-slate-100 p-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback, customer or reference..."
            aria-label="Search customer feedback"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Unable to load feedback</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void loadFeedback()}
              className="mt-3 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="px-5 py-14 text-center text-sm text-slate-500">
            Loading customer feedback...
          </div>
        ) : !error && filteredFeedback.length === 0 ? (
          <EmptyState
            message={
              search.trim()
                ? "No feedback matches your search."
                : activeTab === "COMPLAINT"
                  ? "No customer complaints yet."
                  : activeTab === "SUGGESTION"
                    ? "No customer suggestions yet."
                    : "No customer feedback has been submitted yet."
            }
          />
        ) : !error ? (
          <div className="divide-y divide-slate-100">
            {filteredFeedback.map((item) => (
              <article
                key={item.id}
                className="p-5 transition hover:bg-slate-50/70 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                        item.feedback_type === "COMPLAINT"
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {item.feedback_type === "COMPLAINT" ? "!" : "↗"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {item.is_anonymous
                            ? "Anonymous customer"
                            : item.customer_name || "Customer"}
                        </h3>
                        <TypeBadge type={item.feedback_type} />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Ref. {item.id}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                  {item.message}
                </p>

                {!item.is_anonymous &&
                  (item.customer_name || item.phone) && (
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      {item.customer_name && (
                        <span>
                          <span className="font-semibold text-slate-700">
                            Customer:
                          </span>{" "}
                          {item.customer_name}
                        </span>
                      )}

                      {item.phone && (
                        <span>
                          <span className="font-semibold text-slate-700">
                            Phone:
                          </span>{" "}
                          {item.phone}
                        </span>
                      )}
                    </div>
                  )}
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
