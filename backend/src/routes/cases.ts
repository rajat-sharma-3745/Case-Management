import { Router } from "express";

import { HttpError } from "../http/errors.js";
import {
  createCase,
  deleteCaseWithTaskCascade,
  getCaseById,
  listCasesSortedByNextHearing,
  updateCase,
} from "../services/caseService.js";
import { parseCaseCreate, parseCaseUpdate } from "../validation/caseSchemas.js";
import { assertValidObjectId } from "../validation/objectId.js";

export const casesRouter = Router();

casesRouter.post("/", async (req, res) => {
  const data = parseCaseCreate(req.body);
  const doc = await createCase(data);
  res.status(201).json(doc.toJSON());
});

casesRouter.get("/", async (_req, res) => {
  const list = await listCasesSortedByNextHearing();
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
