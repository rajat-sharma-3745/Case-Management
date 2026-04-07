import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError, apiJson } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { Modal } from "../components/Modal";
import { useDashboardRefresh } from "../dashboard/useDashboardRefresh";
import {
  CASE_STAGES,
  TASK_PRIORITIES,
  type CaseDto,
  type CaseStage,
  type TaskDto,
  type TaskPriority,
  type TaskStatus,
} from "../types/domain";

type CaseForm = {
  caseTitle: string;
  clientName: string;
  courtName: string;
  caseType: string;
  nextHearingDate: string;
  stage: CaseStage;
  notes: string;
};

type TaskForm = {
  title: string;
  dueDate: string;
  ownerName: string;
  priority: TaskPriority;
  status: TaskStatus;
};

const INITIAL_TASK_FORM: TaskForm = {
  title: "",
  dueDate: "",
  ownerName: "",
  priority: "Medium",
  status: "Pending",
};

type PendingDelete = { kind: "case" } | { kind: "task"; taskId: string };

function toDateInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPastDateInput(value: string): boolean {
  if (!value) return false;
  const today = toLocalDateInputValue(new Date());
  return value < today;
}

function toCaseForm(data: CaseDto): CaseForm {
  return {
    caseTitle: data.caseTitle,
    clientName: data.clientName,
    courtName: data.courtName,
    caseType: data.caseType,
    nextHearingDate: toDateInputValue(data.nextHearingDate),
    stage: data.stage,
    notes: data.notes ?? "",
  };
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { bumpDashboardRefresh } = useDashboardRefresh();

  const [caseData, setCaseData] = useState<CaseDto | null>(null);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [caseForm, setCaseForm] = useState<CaseForm | null>(null);
  const [newTask, setNewTask] = useState<TaskForm>(INITIAL_TASK_FORM);
  const [taskEdits, setTaskEdits] = useState<Record<string, TaskForm>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseMessage, setCaseMessage] = useState<string | null>(null);
  const [taskMessage, setTaskMessage] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const isIntern = role === "intern";
  const canDelete = role === "admin";
  const caseId = id ?? "";

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const statusWeight = a.status === b.status ? 0 : a.status === "Pending" ? -1 : 1;
        if (statusWeight !== 0) return statusWeight;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
    [tasks]
  );

  useEffect(() => {
    if (!id) {
      setError("Case id is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([apiJson<CaseDto>(`/cases/${id}`), apiJson<TaskDto[]>(`/cases/${id}/tasks`)])
      .then(([caseResult, taskResult]) => {
        setCaseData(caseResult);
        setCaseForm(toCaseForm(caseResult));
        setTasks(taskResult);
      })
      .catch((e) => {
        const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function setCaseFormField<K extends keyof CaseForm>(key: K, value: CaseForm[K]) {
    setCaseForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function setTaskFormField<K extends keyof TaskForm>(
    target: "new" | { taskId: string },
    key: K,
    value: TaskForm[K]
  ) {
    if (target === "new") {
      setNewTask((current) => ({ ...current, [key]: value }));
      return;
    }
    setTaskEdits((current) => ({
      ...current,
      [target.taskId]: {
        ...(current[target.taskId] ?? INITIAL_TASK_FORM),
        [key]: value,
      },
    }));
  }

  async function handleCaseSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!caseForm || !id) return;
    setWorking(true);
    setCaseMessage(null);
    try {
      const updated = await apiJson<CaseDto>(`/cases/${id}`, {
        method: "PUT",
        body: {
          caseTitle: caseForm.caseTitle.trim(),
          clientName: caseForm.clientName.trim(),
          courtName: caseForm.courtName.trim(),
          caseType: caseForm.caseType.trim(),
          nextHearingDate: new Date(`${caseForm.nextHearingDate}T00:00:00.000Z`).toISOString(),
          stage: caseForm.stage,
          notes: caseForm.notes.trim() || undefined,
        },
      });
      setCaseData(updated);
      setCaseForm(toCaseForm(updated));
      setCaseMessage("Case updated successfully.");
      bumpDashboardRefresh();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
      setCaseMessage(message);
    } finally {
      setWorking(false);
    }
  }

  async function handleDeleteCase() {
    if (!id) return;
    setWorking(true);
    setCaseMessage(null);
    try {
      await apiJson<void>(`/cases/${id}`, { method: "DELETE" });
      bumpDashboardRefresh();
      navigate("/cases");
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setCaseMessage("Only admins can delete cases.");
      } else if (e instanceof ApiError && e.status === 401) {
        setCaseMessage("Please sign in with a valid token before deleting.");
      } else {
        const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
        setCaseMessage(message);
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setWorking(true);
    setTaskMessage(null);
    try {
      const created = await apiJson<TaskDto>(`/cases/${id}/tasks`, {
        method: "POST",
        body: {
          title: newTask.title.trim(),
          dueDate: new Date(`${newTask.dueDate}T00:00:00.000Z`).toISOString(),
          ownerName: newTask.ownerName.trim(),
          priority: newTask.priority,
          status: newTask.status,
        },
      });
      setTasks((current) => [...current, created]);
      setNewTask(INITIAL_TASK_FORM);
      setTaskMessage("Task created.");
      bumpDashboardRefresh();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
      setTaskMessage(message);
    } finally {
      setWorking(false);
    }
  }

  async function handleUpdateTask(task: TaskDto) {
    const form = taskEdits[task._id];
    if (!form) return;
    setWorking(true);
    setTaskMessage(null);
    try {
      const updated = await apiJson<TaskDto>(`/tasks/${task._id}`, {
        method: "PUT",
        body: {
          title: form.title.trim(),
          dueDate: new Date(`${form.dueDate}T00:00:00.000Z`).toISOString(),
          ownerName: form.ownerName.trim(),
          priority: form.priority,
          status: form.status,
        },
      });
      setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setTaskEdits((current) => {
        const copy = { ...current };
        delete copy[task._id];
        return copy;
      });
      setTaskMessage("Task updated.");
      bumpDashboardRefresh();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
      setTaskMessage(message);
    } finally {
      setWorking(false);
    }
  }

  async function handleToggleStatus(task: TaskDto) {
    setWorking(true);
    setTaskMessage(null);
    try {
      const nextStatus: TaskStatus = task.status === "Pending" ? "Completed" : "Pending";
      const updated = await apiJson<TaskDto>(`/tasks/${task._id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      bumpDashboardRefresh();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
      setTaskMessage(message);
    } finally {
      setWorking(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    setWorking(true);
    setTaskMessage(null);
    try {
      await apiJson<void>(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks((current) => current.filter((item) => item._id !== taskId));
      bumpDashboardRefresh();
    } catch (e) {
      const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
      setTaskMessage(message);
    } finally {
      setWorking(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setPendingDelete(null);
    if (pendingDelete.kind === "case") {
      await handleDeleteCase();
      return;
    }
    await handleDeleteTask(pendingDelete.taskId);
  }

  if (loading) {
    return <p className="text-slate-600">Loading case details...</p>;
  }

  if (error || !caseData || !caseForm) {
    return <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error ?? "Case not found."}</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">{caseData.caseTitle}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Case ID: <span className="font-mono">{caseId}</span>
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Case details</h2>
          {isIntern ? <span className="text-sm text-slate-500">Intern mode: delete unavailable</span> : null}
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => void handleCaseSave(e)}>
          <label className="text-sm text-slate-700">
            Case title
            <input
              value={caseForm.caseTitle}
              onChange={(e) => setCaseFormField("caseTitle", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Client name
            <input
              value={caseForm.clientName}
              onChange={(e) => setCaseFormField("clientName", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Court name
            <input
              value={caseForm.courtName}
              onChange={(e) => setCaseFormField("courtName", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Case type
            <input
              value={caseForm.caseType}
              onChange={(e) => setCaseFormField("caseType", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Next hearing date
            <input
              type="date"
              value={caseForm.nextHearingDate}
              onChange={(e) => setCaseFormField("nextHearingDate", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Stage
            <select
              value={caseForm.stage}
              onChange={(e) => setCaseFormField("stage", e.target.value as CaseStage)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              {CASE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Notes
            <textarea
              rows={3}
              value={caseForm.notes}
              onChange={(e) => setCaseFormField("notes", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={working}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {working ? "Save changes..." : "Save changes"}
            </button>
            <button
              type="button"
              disabled={!canDelete || working}
              onClick={() => setPendingDelete({ kind: "case" })}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {working ? "Delete case..." : "Delete case"}
            </button>
          </div>
        </form>
        {caseMessage ? <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{caseMessage}</p> : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={(e) => void handleCreateTask(e)}>
          <label className="text-sm text-slate-700">
            Title
            <input
              value={newTask.title}
              onChange={(e) => setTaskFormField("new", "title", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Owner
            <input
              value={newTask.ownerName}
              onChange={(e) => setTaskFormField("new", "ownerName", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Due date
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setTaskFormField("new", "dueDate", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
            {isPastDateInput(newTask.dueDate) ? (
              <p className="mt-1 text-xs text-amber-700">Due date is in the past. This task will be marked overdue.</p>
            ) : null}
          </label>
          <label className="text-sm text-slate-700">
            Priority
            <select
              value={newTask.priority}
              onChange={(e) => setTaskFormField("new", "priority", e.target.value as TaskPriority)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={working}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900"
            >
              {working ? "Add task..." : "Add task"}
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {sortedTasks.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-600">
              No tasks yet for this case.
            </p>
          ) : null}
          {sortedTasks.map((task) => {
            const edit = taskEdits[task._id] ?? {
              title: task.title,
              dueDate: toDateInputValue(task.dueDate),
              ownerName: task.ownerName,
              priority: task.priority,
              status: task.status,
            };
            const isCompleted = task.status === "Completed";
            const isOverdue = task.status === "Pending" && isPastDateInput(toDateInputValue(task.dueDate));
            return (
              <article
                key={task._id}
                className={`rounded-md border px-4 py-4 ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50/40"
                    : isOverdue
                      ? "border-red-200 bg-red-50/40"
                      : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3
                    className={`font-medium ${
                      isCompleted ? "text-emerald-800 line-through" : isOverdue ? "text-red-800" : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </h3>
                  {isOverdue ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Overdue</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleToggleStatus(task)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {working ? `Mark as ${isCompleted ? "Pending" : "Completed"}...` : `Mark as ${isCompleted ? "Pending" : "Completed"}`}
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-xs text-slate-600">
                    Title
                    <input
                      value={edit.title}
                      onChange={(e) => setTaskFormField({ taskId: task._id }, "title", e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Owner
                    <input
                      value={edit.ownerName}
                      onChange={(e) => setTaskFormField({ taskId: task._id }, "ownerName", e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Due date
                    <input
                      type="date"
                      value={edit.dueDate}
                      onChange={(e) => setTaskFormField({ taskId: task._id }, "dueDate", e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    {isPastDateInput(edit.dueDate) ? (
                      <p className="mt-1 text-xs text-amber-700">
                        Due date is in the past. Task will appear as overdue while pending.
                      </p>
                    ) : null}
                  </label>
                  <label className="text-xs text-slate-600">
                    Priority
                    <select
                      value={edit.priority}
                      onChange={(e) =>
                        setTaskFormField({ taskId: task._id }, "priority", e.target.value as TaskPriority)
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    >
                      {TASK_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleUpdateTask(task)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800"
                  >
                    {working ? "Save task..." : "Save task"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete({ kind: "task", taskId: task._id })}
                    className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700"
                  >
                    {working ? "Delete task..." : "Delete task"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {taskMessage ? <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{taskMessage}</p> : null}
      </section>
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={pendingDelete?.kind === "case" ? "Delete case" : "Delete task"}
        size="md"
      >
        <p className="text-sm text-slate-700">
          {pendingDelete?.kind === "case"
            ? "Delete this case and all linked tasks? This action cannot be undone."
            : "Delete this task? This action cannot be undone."}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirmDelete()}
            disabled={working}
            className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
          >
            {working
              ? pendingDelete?.kind === "case"
                ? "Delete case..."
                : "Delete task..."
              : pendingDelete?.kind === "case"
                ? "Delete case"
                : "Delete task"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
