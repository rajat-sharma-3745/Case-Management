import { createContext } from "react";

import type { Role } from "./roles";

export type AuthContextValue = {
  token: string | null;
  role: Role | null;
  setToken: (token: string | null, options?: { role?: Role }) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
