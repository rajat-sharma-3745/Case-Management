import { Router } from "express";

import { getDashboardSummary } from "../services/dashboardService.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_req, res) => {
  const summary = await getDashboardSummary();
  res.json(summary);
});
