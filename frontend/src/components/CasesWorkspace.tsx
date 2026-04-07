import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ApiError, apiJson } from "../api/client";
import { useDashboardRefresh } from "../dashboard/useDashboardRefresh";
import { CASE_STAGES, type CaseDto, type CaseStage } from "../types/domain";
import { Modal } from "./Modal";
import { SectionCard } from "./SectionCard";

type CreateCaseForm = {
  caseTitle: string;
  clientName: string;
  courtName: string;
  caseType: string;
  nextHearingDate: string;
  stage: CaseStage;
  notes: string;
};

const INITIAL_FORM: CreateCaseForm = {
  caseTitle: "",
  clientName: "",
  courtName: "",
  caseType: "",
  nextHearingDate: "",
  stage: "Filing",
  notes: "",
};

type CasesWorkspaceProps = {
  createInModal?: boolean;
  createModalOpen?: boolean;
  onCloseCreateModal?: () => void;
};

function toDateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

function buildCasesQuery(searchParams: URLSearchParams): string {
  const q = searchParams.get("q")?.trim() ?? "";
  const stage = searchParams.get("stage")?.trim() ?? "";
  const from = searchParams.get("from")?.trim() ?? "";
  const to = searchParams.get("to")?.trim() ?? "";
  const out = new URLSearchParams();
  if (q) out.set("q", q);
  if (stage) out.set("stage", stage);
  if (from) out.set("from", from);
  if (to) out.set("to", to);
  const query = out.toString();
  return query ? `?${query}` : "";
}

export function CasesWorkspace({
  createInModal = false,
  createModalOpen = false,
  onCloseCreateModal,
}: CasesWorkspaceProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { bumpDashboardRefresh } = useDashboardRefresh();
  const [cases, setCases] = useState<CaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<CreateCaseForm>(INITIAL_FORM);
  const [qInput, setQInput] = useState(searchParams.get("q") ?? "");
  const [stageInput, setStageInput] = useState(searchParams.get("stage") ?? "");
  const [fromInput, setFromInput] = useState(searchParams.get("from") ?? "");
  const [toInput, setToInput] = useState(searchParams.get("to") ?? "");

  const listPath = useMemo(() => `/cases${buildCasesQuery(searchParams)}`, [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        const q = qInput.trim();
        if (q) next.set("q", q);
        else next.delete("q");
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [qInput, setSearchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiJson<CaseDto[]>(listPath)
      .then((data) => setCases(data))
      .catch((e) => {
        const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [listPath]);

  function setFormField<K extends keyof CreateCaseForm>(key: K, value: CreateCaseForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateForm(data: CreateCaseForm): Record<string, string> {
    const errors: Record<string, string> = {};
    if (data.caseTitle.trim().length < 3) errors.caseTitle = "Case title must be at least 3 characters.";
    if (!data.clientName.trim()) errors.clientName = "Client name is required.";
    if (!data.courtName.trim()) errors.courtName = "Court name is required.";
    if (!data.caseType.trim()) errors.caseType = "Case type is required.";
    if (!data.nextHearingDate) errors.nextHearingDate = "Next hearing date is required.";
    if (!CASE_STAGES.includes(data.stage)) errors.stage = "Stage is invalid.";
    return errors;
  }

  async function handleCreateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiJson<CaseDto>("/cases", {
        method: "POST",
        body: {
          caseTitle: form.caseTitle.trim(),
          clientName: form.clientName.trim(),
          courtName: form.courtName.trim(),
          caseType: form.caseType.trim(),
          nextHearingDate: new Date(`${form.nextHearingDate}T00:00:00.000Z`).toISOString(),
          stage: form.stage,
          notes: form.notes.trim() || undefined,
        },
      });
      setCases((current) =>
        [...current, created].sort(
          (a, b) => new Date(a.nextHearingDate).getTime() - new Date(b.nextHearingDate).getTime()
        )
      );
      setForm(INITIAL_FORM);
      setFieldErrors({});
      bumpDashboardRefresh();
      if (createInModal) {
        onCloseCreateModal?.();
      }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderCreateForm() {
    return (
      <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => void handleCreateCase(e)}>
        <label className="text-sm text-slate-700">
          Case title
          <input
            value={form.caseTitle}
            onChange={(e) => setFormField("caseTitle", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          {fieldErrors.caseTitle ? <span className="mt-1 block text-red-700">{fieldErrors.caseTitle}</span> : null}
        </label>
        <label className="text-sm text-slate-700">
          Client name
          <input
            value={form.clientName}
            onChange={(e) => setFormField("clientName", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          {fieldErrors.clientName ? <span className="mt-1 block text-red-700">{fieldErrors.clientName}</span> : null}
        </label>
        <label className="text-sm text-slate-700">
          Court name
          <input
            value={form.courtName}
            onChange={(e) => setFormField("courtName", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          {fieldErrors.courtName ? <span className="mt-1 block text-red-700">{fieldErrors.courtName}</span> : null}
        </label>
        <label className="text-sm text-slate-700">
          Case type
          <input
            value={form.caseType}
            onChange={(e) => setFormField("caseType", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          {fieldErrors.caseType ? <span className="mt-1 block text-red-700">{fieldErrors.caseType}</span> : null}
        </label>
        <label className="text-sm text-slate-700">
          Next hearing date
          <input
            type="date"
            value={form.nextHearingDate}
            onChange={(e) => setFormField("nextHearingDate", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          {fieldErrors.nextHearingDate ? (
            <span className="mt-1 block text-red-700">{fieldErrors.nextHearingDate}</span>
          ) : null}
        </label>
        <label className="text-sm text-slate-700">
          Stage
          <select
            value={form.stage}
            onChange={(e) => setFormField("stage", e.target.value as CaseStage)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          >
            {CASE_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          Notes (optional)
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setFormField("notes", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create case"}
          </button>
          {submitError ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Search and filters</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search title or client"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
          <select
            value={stageInput}
            onChange={(e) => {
              const value = e.target.value;
              setStageInput(value);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("stage", value);
                else next.delete("stage");
                return next;
              });
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          >
            <option value="">All stages</option>
            {CASE_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={fromInput}
            onChange={(e) => {
              const value = e.target.value;
              setFromInput(value);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("from", value);
                else next.delete("from");
                return next;
              });
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
          <input
            type="date"
            value={toInput}
            onChange={(e) => {
              const value = e.target.value;
              setToInput(value);
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("to", value);
                else next.delete("to");
                return next;
              });
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setQInput("");
            setStageInput("");
            setFromInput("");
            setToInput("");
            setSearchParams(new URLSearchParams());
          }}
          className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Clear filters
        </button>
      </SectionCard>

      {!createInModal ? (
        <SectionCard className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Create case</h2>
          <div className="mt-4">{renderCreateForm()}</div>
        </SectionCard>
      ) : null}

      <SectionCard className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Case list</h2>
        {loading ? <p className="mt-3 text-sm text-slate-600">Loading cases...</p> : null}
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && cases.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600">
            No cases found. Create your first case to get started.
          </p>
        ) : null}
        {!loading && !error && cases.length > 0 ? (
          <div className="mt-4 w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Court</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Hearing</th>
                  <th className="px-3 py-2">Stage</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="max-w-[260px] truncate px-3 py-2 font-medium text-slate-900">
                      <Link className="text-blue-700 hover:underline" to={`/cases/${item._id}`}>
                        {item.caseTitle}
                      </Link>
                    </td>
                    <td className="max-w-[150px] truncate px-3 py-2 text-slate-700">{item.clientName}</td>
                    <td className="max-w-[170px] truncate px-3 py-2 text-slate-700">{item.courtName}</td>
                    <td className="max-w-[130px] truncate px-3 py-2 text-slate-700">{item.caseType}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{toDateInputValue(item.nextHearingDate)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">{item.stage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </SectionCard>

      {createInModal ? (
        <Modal open={createModalOpen} onClose={() => onCloseCreateModal?.()} title="Create case">
          {renderCreateForm()}
        </Modal>
      ) : null}
    </div>
  );
}
