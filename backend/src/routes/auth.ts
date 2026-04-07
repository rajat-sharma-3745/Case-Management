import { Router } from "express";
import { z } from "zod";

import { signRoleToken } from "../auth/jwt.js";

const devTokenBodySchema = z.object({
  role: z.enum(["admin", "intern"]),
});

export const authRouter = Router();

authRouter.post("/dev-token", (req, res, next) => {
  try {
    const { role } = devTokenBodySchema.parse(req.body);
    const token = signRoleToken(role);
    res.json({ token, role });
  } catch (err) {
    next(err);
  }
});
