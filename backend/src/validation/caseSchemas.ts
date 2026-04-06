import { z } from "zod";

import { CASE_STAGES } from "../models/Case.js";

const notesField = z
  .string()
  .trim()
  .max(5000)
  .optional();

export const caseCreateSchema = z.object({
  caseTitle: z.string().trim().min(3).max(500),
  clientName: z.string().trim().min(1).max(200),
  courtName: z.string().trim().min(1).max(200),
  caseType: z.string().trim().min(1).max(120),
  nextHearingDate: z.coerce.date(),
  stage: z.enum(CASE_STAGES),
  notes: notesField,
});

export const caseUpdateSchema = caseCreateSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required",
  });

export type CaseCreateInput = z.infer<typeof caseCreateSchema>;
export type CaseUpdateInput = z.infer<typeof caseUpdateSchema>;

export function parseCaseCreate(body: unknown): CaseCreateInput {
  return caseCreateSchema.parse(body);
}

export function parseCaseUpdate(body: unknown): CaseUpdateInput {
  return caseUpdateSchema.parse(body);
}
