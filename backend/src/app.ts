import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/errorHandler.js";
import "./models/Case.js";
import "./models/Task.js";
import { authRouter } from "./routes/auth.js";
import { casesRouter } from "./routes/cases.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { tasksRouter } from "./routes/tasks.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    app.use("/auth", authRouter);
  }

  app.use("/cases", casesRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/tasks", tasksRouter);

  app.use(errorHandler);
  return app;
}

export const app = createApp();
