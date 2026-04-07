import { z } from "zod";

import { CASE_STAGES } from "../models/Case.js";

function firstQueryString(val: unknown): string | undefined {
  if (val === undefined || val === null) {
    return undefined;
  }
  if (Array.isArray(val)) {
    const first = val[0];
    return typeof first === "string" ? first : undefined;
  }
  if (typeof val === "string") {
    return val;
  }
  return undefined;
}

const optionalCoercedDate = z.preprocess(
  (val: unknown) => {
    const s = firstQueryString(val);
    if (s === undefined || s === "") {
      return undefined;
    }
    return s;
  },
  z.coerce
    .date()
    .refine((d) => !Number.isNaN(d.getTime()), { message: "Invalid date" })
    .optional()
);

const caseListQuerySchema = z.object({
  q: z.preprocess(
    (val: unknown) => {
      const s = firstQueryString(val);
      if (s === undefined) {
        return undefined;
      }
      const t = s.trim();
      return t === "" ? undefined : t;
    },
    z.string().min(1).optional()
  ),
  stage: z.preprocess(
    (val: unknown) => {
      const s = firstQueryString(val);
      if (s === undefined || s === "") {
        return undefined;
      }
      return s;
    },
    z.enum(CASE_STAGES).optional()
  ),
  from: optionalCoercedDate,
  to: optionalCoercedDate,
});

export type CaseListFilters = z.infer<typeof caseListQuerySchema>;

export function parseCaseListQuery(query: unknown): CaseListFilters {
  const raw = query as Record<string, unknown>;
  return caseListQuerySchema.parse({
    q: raw.q,
    stage: raw.stage,
    from: raw.from,
    to: raw.to,
  });
}

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
