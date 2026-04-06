import mongoose, { Schema } from "mongoose";

export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ["Pending", "Completed"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

const taskSchema = new Schema(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 300,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    priority: {
      type: String,
      required: true,
      enum: TASK_PRIORITIES,
      default: "Medium",
    },
    status: {
      type: String,
      required: true,
      enum: TASK_STATUSES,
      default: "Pending",
    },
  },
  { timestamps: true }
);

taskSchema.index({ caseId: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

export type TaskDoc = mongoose.InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Task = mongoose.model("Task", taskSchema);
