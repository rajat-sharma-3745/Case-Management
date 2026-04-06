import mongoose from "mongoose";

import { Case } from "../models/Case.js";
import { Task } from "../models/Task.js";
import type { CaseCreateInput, CaseUpdateInput } from "../validation/caseSchemas.js";

function caseCreateDocumentPayload(data: CaseCreateInput) {
  const { notes, ...rest } = data;
  return notes === undefined ? rest : { ...rest, notes };
}

export async function createCase(input: CaseCreateInput) {
  return Case.create(caseCreateDocumentPayload(input));
}

export async function listCasesSortedByNextHearing() {
  return Case.find().sort({ nextHearingDate: 1 }).lean();
}

export async function getCaseById(id: string) {
  return Case.findById(id).lean();
}

export async function updateCase(id: string, data: CaseUpdateInput) {
  return Case.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
}

/** Cascade: delete tasks for this case before removing the case. */
export async function deleteCaseWithTaskCascade(id: string): Promise<boolean> {
  const existing = await Case.findById(id);
  if (existing === null) {
    return false;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Task.deleteMany({ caseId: id }).session(session);
    await Case.findByIdAndDelete(id, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  return true;
}
