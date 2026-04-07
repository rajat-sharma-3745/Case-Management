import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { configureApiClient } from "../api/client";
import { AuthContext } from "./context";
import { readRoleFromToken } from "./jwtPayload";
import type { Role } from "./roles";

const STORAGE_KEY = "cms_auth_token";
const STORAGE_KEY_ROLE = "cms_auth_role";

function loadStoredAuth(): { token: string | null; roleFromServer: Role | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const token = raw && raw.trim() !== "" ? raw.trim() : null;
    const roleRaw = localStorage.getItem(STORAGE_KEY_ROLE);
    const roleFromServer =
      roleRaw === "admin" || roleRaw === "intern" ? roleRaw : null;
    return { token, roleFromServer };
  } catch {
    return { token: null, roleFromServer: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadStoredAuth();
  const [token, setTokenState] = useState<string | null>(() => initial.token);
  const [roleFromServer, setRoleFromServer] = useState<Role | null>(() => initial.roleFromServer);

  const setToken = useCallback((next: string | null, options?: { role?: Role }) => {
    setTokenState(next);
    try {
      if (next === null) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY_ROLE);
        setRoleFromServer(null);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
        if (options?.role !== undefined) {
          localStorage.setItem(STORAGE_KEY_ROLE, options.role);
          setRoleFromServer(options.role);
        } else {
          localStorage.removeItem(STORAGE_KEY_ROLE);
          setRoleFromServer(null);
        }
      }
    } catch {
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const role = useMemo(
    () => (token ? roleFromServer ?? readRoleFromToken(token) : null),
    [token, roleFromServer]
  );

  useEffect(() => {
    configureApiClient({ getToken: () => token });
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      role,
      setToken,
      logout,
    }),
    [token, role, setToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
