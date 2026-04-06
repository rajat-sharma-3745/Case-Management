import cors from "cors";
import express from "express";
import type { ErrorRequestHandler } from "express";

import { PORT } from "./config.js";
import { connectMongo } from "./db.js";
import "./models/Case.js";
import "./models/Task.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
};

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
