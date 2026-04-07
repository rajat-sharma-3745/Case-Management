import { useCallback, useEffect, useState } from "react";

import { ApiError, apiJson } from "../api/client";
import { CasesWorkspace } from "../components/CasesWorkspace";
import { InlineError } from "../components/InlineError";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { Skeleton } from "../components/Skeleton";
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummaryDto>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<DashboardSummaryDto>("/dashboard/summary");
      setSummary(data);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to load dashboard summary.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [refreshToken, loadSummary]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Key metrics for current case and task activity."
        actions={
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create case
          </button>
        }
      />
      {loading ? (
        <div className="space-y-4" aria-busy="true">
          <LoadingState message="Loading summary..." size="sm" />
          <DashboardSkeleton />
        </div>
      ) : null}
      {!loading && error ? <InlineError message={error} onRetry={() => void loadSummary()} /> : null}
      {!loading && !error ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active cases" value={summary.activeCases} />
          <MetricCard label="Hearings next 7 days" value={summary.hearingsNext7Days} />
          <MetricCard label="Pending tasks" value={summary.tasksPending} />
          <MetricCard label="Completed tasks" value={summary.tasksCompleted} />
        </div>
      ) : null}
      <CasesWorkspace
        createInModal
        createModalOpen={createModalOpen}
        onCloseCreateModal={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <SectionCard className="p-4 sm:p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </SectionCard>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <SectionCard key={idx} className="space-y-3 p-4 sm:p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-16" />
        </SectionCard>
      ))}
    </div>
  );
}
