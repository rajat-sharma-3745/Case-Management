import { PORT } from "./config.js";
import { connectMongo } from "./db.js";
import { app } from "./app.js";

async function start(): Promise<void> {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
