import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { signRoleToken } from "../../auth/jwt.js";
import { app } from "../../app.js";

describe("cases API", () => {
  it("returns 400 for invalid case payload", async () => {
    const response = await request(app).post("/cases").send({
      clientName: "Client A",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  it("returns 404 for a missing case id", async () => {
    const missingId = new mongoose.Types.ObjectId().toString();

    const response = await request(app).get(`/cases/${missingId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Case not found" });
  });

  it("returns 403 for intern delete attempts", async () => {
    const createdCase = await request(app).post("/cases").send({
      caseTitle: "Intern Forbidden Delete",
      clientName: "Client A",
      courtName: "Court A",
      caseType: "Civil",
      nextHearingDate: new Date().toISOString(),
      stage: "Filing",
    });

    expect(createdCase.status).toBe(201);

    const internToken = signRoleToken("intern");
    const deleteResponse = await request(app)
      .delete(`/cases/${createdCase.body._id}`)
      .set("Authorization", `Bearer ${internToken}`);

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body).toEqual({ message: "Admin role required" });
  });
});
