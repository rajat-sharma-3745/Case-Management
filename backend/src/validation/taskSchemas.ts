import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "../models/Task.js";

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  dueDate: z.coerce.date(),
  ownerName: z.string().trim().min(1).max(200),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES).optional(),
});

export const taskUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    dueDate: z.coerce.date().optional(),
    ownerName: z.string().trim().min(1).max(200).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    status: z.enum(TASK_STATUSES).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required",
  });

export const taskStatusPatchSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskStatusPatchInput = z.infer<typeof taskStatusPatchSchema>;

export function parseTaskCreate(body: unknown): TaskCreateInput {
  return taskCreateSchema.parse(body);
}

export function parseTaskUpdate(body: unknown): TaskUpdateInput {
  return taskUpdateSchema.parse(body);
}

export function parseTaskStatusPatch(body: unknown): TaskStatusPatchInput {
  return taskStatusPatchSchema.parse(body);
}
