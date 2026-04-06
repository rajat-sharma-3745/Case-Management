import { Task } from "../models/Task.js";
import type { TaskStatus } from "../models/Task.js";
import type {
  TaskCreateInput,
  TaskUpdateInput,
} from "../validation/taskSchemas.js";

export async function createTaskForCase(caseId: string, input: TaskCreateInput) {
  const { status, ...rest } = input;
  return Task.create(
    status === undefined ? { ...rest, caseId } : { ...rest, caseId, status }
  );
}

export async function listTasksForCase(caseId: string) {
  return Task.find({ caseId }).sort({ dueDate: 1 }).lean();
}

export async function updateTask(id: string, data: TaskUpdateInput) {
  return Task.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await Task.findByIdAndDelete(id);
  return result !== null;
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return Task.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  );
}
