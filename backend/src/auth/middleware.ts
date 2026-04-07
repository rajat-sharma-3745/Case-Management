import type { RequestHandler } from "express";

import { HttpError } from "../http/errors.js";
import { verifyRoleToken } from "./jwt.js";

function parseBearerToken(authorization: string | undefined): string | null {
  if (authorization === undefined || authorization.trim() === "") {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1] ?? null;
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = parseBearerToken(req.headers.authorization);
  if (token === null) {
    next(new HttpError(401, "Authentication required"));
    return;
  }
  try {
    const { role } = verifyRoleToken(token);
    req.user = { role };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    next(new HttpError(403, "Admin role required"));
    return;
  }
  next();
};
