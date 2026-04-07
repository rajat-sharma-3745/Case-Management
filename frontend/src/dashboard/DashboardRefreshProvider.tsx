import { useCallback, useMemo, useState, type ReactNode } from "react";

import { DashboardRefreshContext } from "./useDashboardRefresh";

export function DashboardRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshToken, setRefreshToken] = useState(0);

  const bumpDashboardRefresh = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({ refreshToken, bumpDashboardRefresh }),
    [refreshToken, bumpDashboardRefresh]
  );

  return <DashboardRefreshContext.Provider value={value}>{children}</DashboardRefreshContext.Provider>;
}
