import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../app.js";

describe("dashboard API", () => {
  it("returns zeroed summary for an empty database", async () => {
    const response = await request(app).get("/dashboard/summary");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      activeCases: 0,
      hearingsNext7Days: 0,
      tasksPending: 0,
      tasksCompleted: 0,
    });
  });
});
