import { useEffect, useState } from "react";

import { ApiError, apiJson } from "../api/client";
import { useDashboardRefresh } from "../dashboard/useDashboardRefresh";
import type { DashboardSummaryDto } from "../types/domain";

const EMPTY_SUMMARY: DashboardSummaryDto = {
  activeCases: 0,
  hearingsNext7Days: 0,
  tasksPending: 0,
  tasksCompleted: 0,
};

export function DashboardPage() {
  const { refreshToken } = useDashboardRefresh();
  const [summary, setSummary] = useState<DashboardSummaryDto>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiJson<DashboardSummaryDto>("/dashboard/summary")
      .then((data) => {
        if (!active) return;
        setSummary(data);
        setError(null);
      })
      .catch((e) => {
        if (!active) return;
        const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
        setError(message);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [refreshToken]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Key metrics for current case and task activity.</p>
      </div>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-600">Loading summary...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Active cases" value={summary.activeCases} />
        <MetricCard label="Hearings next 7 days" value={summary.hearingsNext7Days} />
        <MetricCard label="Pending tasks" value={summary.tasksPending} />
        <MetricCard label="Completed tasks" value={summary.tasksCompleted} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </article>
  );
}
