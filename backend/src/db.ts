import mongoose from "mongoose";

import { MONGODB_URI } from "./config.js";

export async function connectMongo(): Promise<void> {
  if (MONGODB_URI === undefined || MONGODB_URI.trim() === "") {
    console.error(
      "MONGODB_URI is missing or empty."
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
}
