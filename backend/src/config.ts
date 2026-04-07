import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required for signing and verifying tokens"),
  PORT: z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined || s.trim() === "") return 3000;
      const n = Number.parseInt(s, 10);
      if (!Number.isFinite(n) || n < 1 || n > 65535) return 3000;
      return n;
    }),
  MONGODB_URI: z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined || s.trim() === "") return undefined;
      return s;
    }),
});

const parsed = envSchema.safeParse({
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const JWT_SECRET = parsed.data.JWT_SECRET;
export const PORT = parsed.data.PORT;
export const MONGODB_URI = parsed.data.MONGODB_URI;
