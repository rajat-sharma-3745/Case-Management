import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { HttpError } from "../http/errors.js";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
): void => {
  if (err instanceof HttpError) {
    const body: { message: string; details?: unknown } = {
      message: err.message,
    };
    if (err.details !== undefined) {
      body.details = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
};
