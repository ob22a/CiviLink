import request from "supertest";
import app from "../src/index.js";

describe("Health check", () => {
  it("returns 200 and ok status", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ok");
  });
});
