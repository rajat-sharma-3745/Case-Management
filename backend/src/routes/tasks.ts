import { Router } from "express";

import { HttpError } from "../http/errors.js";
import {
  deleteTask,
  updateTask,
  updateTaskStatus,
} from "../services/taskService.js";
import {
  parseTaskStatusPatch,
  parseTaskUpdate,
} from "../validation/taskSchemas.js";
import { assertValidObjectId } from "../validation/objectId.js";

export const tasksRouter = Router();

tasksRouter.put("/:id", async (req, res) => {
  assertValidObjectId(req.params.id);
  const data = parseTaskUpdate(req.body);
  const updated = await updateTask(req.params.id, data);
  if (updated === null) {
    throw new HttpError(404, "Task not found");
  }
  res.json(updated.toJSON());
});

tasksRouter.delete("/:id", async (req, res) => {
  assertValidObjectId(req.params.id);
  const deleted = await deleteTask(req.params.id);
  if (!deleted) {
    throw new HttpError(404, "Task not found");
  }
  res.status(204).send();
});

tasksRouter.patch("/:id/status", async (req, res) => {
  assertValidObjectId(req.params.id);
  const { status } = parseTaskStatusPatch(req.body);
  const updated = await updateTaskStatus(req.params.id, status);
  if (updated === null) {
    throw new HttpError(404, "Task not found");
  }
  res.json(updated.toJSON());
});
