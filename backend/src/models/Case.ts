import mongoose, { Schema } from "mongoose";

export const CASE_STAGES = [
  "Filing",
  "Evidence",
  "Arguments",
  "Order Reserved",
] as const;

export type CaseStage = (typeof CASE_STAGES)[number];

const caseSchema = new Schema(
  {
    caseTitle: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 500,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    courtName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    caseType: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    nextHearingDate: {
      type: Date,
      required: true,
    },
    stage: {
      type: String,
      required: true,
      enum: CASE_STAGES,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
  },
  { timestamps: true }
);

caseSchema.index({ nextHearingDate: 1 });
caseSchema.index({ stage: 1 });

export type CaseDoc = mongoose.InferSchemaType<typeof caseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Case = mongoose.model("Case", caseSchema);
