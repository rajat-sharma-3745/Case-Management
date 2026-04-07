import { DevAuthPanel } from "../auth/DevAuthPanel";

export function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome</h1>
        <p className="mt-2 text-slate-600">
          Use the panel below to sign in for local development, or continue to Cases and Dashboard once
          authenticated.
        </p>
      </div>
      <DevAuthPanel />
    </div>
  );
}
