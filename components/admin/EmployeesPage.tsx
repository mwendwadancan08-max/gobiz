
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Employee = {
  id: string;
  full_name: string;
  email: string;
  approval_status: "PENDING" | "APPROVED" | "BANNED" | "DELETED";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};

type EmployeeStatus = Employee["approval_status"];

const tabs: { label: string; value: EmployeeStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Banned", value: "BANNED" },
  { label: "Deleted", value: "DELETED" },
];

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<EmployeeStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/employees", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load employees.");
      }

      setEmployees(result.employees || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const counts = useMemo(() => {
    return {
      PENDING: employees.filter((e) => e.approval_status === "PENDING").length,
      APPROVED: employees.filter((e) => e.approval_status === "APPROVED").length,
      BANNED: employees.filter((e) => e.approval_status === "BANNED").length,
      DELETED: employees.filter((e) => e.approval_status === "DELETED").length,
    };
  }, [employees]);

  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesTab = employee.approval_status === activeTab;
      const matchesSearch =
        !query ||
        employee.full_name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [employees, activeTab, search]);

  async function performAction(
    employee: Employee,
    action: "APPROVE" | "BAN" | "DELETE" | "RESTORE"
  ) {
    const prompts = {
      APPROVE: `Approve ${employee.full_name} as a GoBiz employee?`,
      BAN: `Ban ${employee.full_name}? They will lose workspace access.`,
      DELETE: `Move ${employee.full_name} to Deleted employees? Their record will be retained.`,
      RESTORE: `Restore ${employee.full_name} to Pending approval?`,
    };

    if (!window.confirm(prompts[action])) return;

    setWorkingId(employee.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: employee.id,
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Employee action failed.");
      }

      const messages = {
        APPROVE: `${employee.full_name} has been approved.`,
        BAN: `${employee.full_name} has been banned.`,
        DELETE: `${employee.full_name} has been moved to Deleted employees.`,
        RESTORE: `${employee.full_name} has been restored to Pending approval.`,
      };

      setNotice(messages[action]);
      await loadEmployees();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Employee action failed."
      );
    } finally {
      setWorkingId(null);
    }
  }

  function renderActions(employee: Employee) {
    const busy = workingId === employee.id;

    return (
      <div className="flex flex-wrap gap-2">
        {employee.approval_status === "PENDING" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => performAction(employee, "APPROVE")}
              className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {busy ? "Working..." : "Approve"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => performAction(employee, "BAN")}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              Ban
            </button>
          </>
        )}

        {employee.approval_status === "APPROVED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => performAction(employee, "BAN")}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {busy ? "Working..." : "Ban employee"}
          </button>
        )}

        {employee.approval_status === "BANNED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => performAction(employee, "RESTORE")}
            className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {busy ? "Working..." : "Restore"}
          </button>
        )}

        {employee.approval_status !== "DELETED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => performAction(employee, "DELETE")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Delete
          </button>
        )}

        {employee.approval_status === "DELETED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => performAction(employee, "RESTORE")}
            className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {busy ? "Working..." : "Restore"}
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#10291f]">
            Employee management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review applications and control employee workspace access.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEmployees}
          disabled={loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-2xl border p-4 text-left transition ${
              activeTab === tab.value
                ? "border-green-700 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-sm text-gray-500">{tab.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#10291f]">
              {counts[tab.value]}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-[#10291f]">
              {tabs.find((tab) => tab.value === activeTab)?.label} employees
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {visibleEmployees.length} account
              {visibleEmployees.length === 1 ? "" : "s"}
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 sm:max-w-xs"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading employee accounts...
          </div>
        ) : visibleEmployees.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-gray-700">
              No {activeTab.toLowerCase()} employees found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Employee accounts in this category will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleEmployees.map((employee) => (
              <article
                key={employee.id}
                className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#10291f]">
                      {employee.full_name || "Unnamed employee"}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        employee.approval_status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : employee.approval_status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : employee.approval_status === "BANNED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {employee.approval_status}
                    </span>
                  </div>

                  <p className="mt-1 break-all text-sm text-gray-600">
                    {employee.email}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>Registered: {formatDate(employee.created_at)}</span>
                    {employee.approved_at && (
                      <span>
                        Approved: {formatDate(employee.approved_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">{renderActions(employee)}</div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
