import { Router } from "express";

import { HttpError } from "../http/errors.js";
import {
  createCase,
  deleteCaseWithTaskCascade,
  getCaseById,
  listCasesWithFilters,
  updateCase,
} from "../services/caseService.js";
import {
  createTaskForCase,
  listTasksForCase,
} from "../services/taskService.js";
import {
  parseCaseCreate,
  parseCaseListQuery,
  parseCaseUpdate,
} from "../validation/caseSchemas.js";
import { parseTaskCreate } from "../validation/taskSchemas.js";
import { assertValidObjectId } from "../validation/objectId.js";

export const casesRouter = Router();

casesRouter.post("/", async (req, res) => {
  const data = parseCaseCreate(req.body);
  const doc = await createCase(data);
  res.status(201).json(doc.toJSON());
});

casesRouter.get("/", async (req, res) => {
  const filters = parseCaseListQuery(req.query);
  const list = await listCasesWithFilters(filters);
  res.json(list);
});

casesRouter.post("/:id/tasks", async (req, res) => {
  assertValidObjectId(req.params.id);
  const parent = await getCaseById(req.params.id);
  if (parent === null) {
    throw new HttpError(404, "Case not found");
  }
  const data = parseTaskCreate(req.body);
  const doc = await createTaskForCase(req.params.id, data);
  res.status(201).json(doc.toJSON());
});

casesRouter.get("/:id/tasks", async (req, res) => {
  assertValidObjectId(req.params.id);
  const parent = await getCaseById(req.params.id);
  if (parent === null) {
    throw new HttpError(404, "Case not found");
  }
  const list = await listTasksForCase(req.params.id);
  res.json(list);
});

casesRouter.get("/:id", async (req, res) => {
  assertValidObjectId(req.params.id);
  const doc = await getCaseById(req.params.id);
  if (doc === null) {
    throw new HttpError(404, "Case not found");
  }
  res.json(doc);
});

casesRouter.put("/:id", async (req, res) => {
  assertValidObjectId(req.params.id);
  const data = parseCaseUpdate(req.body);
  const updated = await updateCase(req.params.id, data);
  if (updated === null) {
    throw new HttpError(404, "Case not found");
  }
  res.json(updated.toJSON());
});

casesRouter.delete("/:id", async (req, res) => {
  assertValidObjectId(req.params.id);
  const deleted = await deleteCaseWithTaskCascade(req.params.id);
  if (!deleted) {
    throw new HttpError(404, "Case not found");
  }
  res.status(204).send();
});
