import cors from "cors";
import express from "express";
import { PORT } from "./config.js";
import { connectMongo } from "./db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./models/Case.js";
import "./models/Task.js";
import { authRouter } from "./routes/auth.js";
import { casesRouter } from "./routes/cases.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { tasksRouter } from "./routes/tasks.js";

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

async function start(): Promise<void> {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
