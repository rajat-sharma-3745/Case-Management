import { createContext, useContext } from "react";

export type DashboardRefreshContextValue = {
  refreshToken: number;
  bumpDashboardRefresh: () => void;
};

export const DashboardRefreshContext = createContext<DashboardRefreshContextValue | null>(null);

export function useDashboardRefresh() {
  const ctx = useContext(DashboardRefreshContext);
  if (ctx === null) {
    throw new Error("useDashboardRefresh must be used within DashboardRefreshProvider");
  }
  return ctx;
}
