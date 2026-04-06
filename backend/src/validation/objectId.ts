import mongoose from "mongoose";

import { HttpError } from "../http/errors.js";

export function assertValidObjectId(id: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid id");
  }
}
