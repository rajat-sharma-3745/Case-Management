import type { Role } from "../auth/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: { role: Role };
    }
  }
}

export {};
