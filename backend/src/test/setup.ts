import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-jwt-secret";

beforeAll(async () => {
  const uri = process.env.MONGODB_URI_TEST ?? process.env.MONGODB_URI;
  if (!uri || uri.trim() === "") {
    throw new Error("Set MONGODB_URI_TEST (or MONGODB_URI) before running backend tests.");
  }
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});
