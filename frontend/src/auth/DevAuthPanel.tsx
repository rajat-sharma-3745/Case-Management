import { useState } from "react";

import { ApiError, apiJson } from "../api/client";
import { useAuth } from "./useAuth";
import type { Role } from "./roles";

export function DevAuthPanel() {
  const { token, role, setToken, logout } = useAuth();
  const [mintRole, setMintRole] = useState<Role>("intern");
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleMint() {
    setError(null);
    setLoading(true);
    try {
      const data = await apiJson<{ token: string; role: Role }>("/auth/dev-token", {
        method: "POST",
        body: { role: mintRole },
        skipAuth: true,
      });
      setToken(data.token, { role: data.role });
      setPasteValue("");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handlePasteApply() {
    setError(null);
    const trimmed = pasteValue.trim();
    if (trimmed === "") {
      setError("Paste a token first.");
      return;
    }
    setToken(trimmed);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Dev sign-in</h2>
      <p className="mt-1 text-sm text-slate-600">
        Uses <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">POST /auth/dev-token</code>{" "}
        when the API runs in non-production. Or paste a CLI-minted token.
      </p>

      {token ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-700">
            Signed in as{" "}
            <span className="font-semibold text-slate-900">{role ?? "unknown role"}</span>
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <div>
            <label htmlFor="mint-role" className="block text-sm font-medium text-slate-700">
              Role for new token
            </label>
            <select
              id="mint-role"
              value={mintRole}
              onChange={(e) => setMintRole(e.target.value as Role)}
              className="mt-1 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="intern">intern</option>
              <option value="admin">admin</option>
            </select>
            <button
              type="button"
              onClick={() => void handleMint()}
              disabled={loading}
              className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Requesting…" : "Get token from API"}
            </button>
          </div>

          <div>
            <label htmlFor="paste-token" className="block text-sm font-medium text-slate-700">
              Or paste token
            </label>
            <textarea
              id="paste-token"
              rows={3}
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="mt-1 w-full max-w-lg rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <button
              type="button"
              onClick={handlePasteApply}
              className="mt-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Use pasted token
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
