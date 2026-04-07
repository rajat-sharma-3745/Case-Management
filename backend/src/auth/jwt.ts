import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config.js";

export type Role = "admin" | "intern";

type RolePayload = {
  role: Role;
};

function isRole(value: unknown): value is Role {
  return value === "admin" || value === "intern";
}

export function signRoleToken(role: Role): string {
  const payload: RolePayload = { role };
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyRoleToken(token: string): RolePayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }
  const role = (decoded as Record<string, unknown>)["role"];
  if (!isRole(role)) {
    throw new Error("Invalid role in token");
  }
  return { role };
}
