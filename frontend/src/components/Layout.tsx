import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { DevAuthPanel } from "../auth/DevAuthPanel";
import { useAuth } from "../auth/useAuth";
import { Modal } from "./Modal";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-700 hover:bg-slate-200/80",
  ].join(" ");

export function Layout() {
  const { token, role } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <span className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            Case Management
          </span>
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <NavLink to="/" className={linkClass} end>
              Dashboard
            </NavLink>
            {token ? (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                {role ? `Signed in: ${role}` : "Account"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <Modal title="Account" open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <DevAuthPanel />
      </Modal>
    </div>
  );
}
