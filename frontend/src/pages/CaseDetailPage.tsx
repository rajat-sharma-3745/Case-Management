import { useParams } from "react-router-dom";

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Case</h1>
      <p className="mt-2 text-slate-600">
        Detail for case <span className="font-mono text-slate-800">{id ?? "—"}</span> — later.
      </p>
    </div>
  );
}
