import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";

import request from "supertest";
import app from "../src/index.js";
import mongoose from "mongoose";
import SecurityLog from "../src/models/SecurityLog.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.test" });
jest.setTimeout(30000);

let adminToken;
const agent = request.agent(app);

// Create exports directory if it doesn't exist
const exportsDir = path.join(process.cwd(), "exports");
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_DB_URI);
  await mongoose.connection.dropDatabase();

  // Create admin user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Admin123!", salt);

  let AdminModel = User;
  if (User.discriminators && User.discriminators.admin) {
    AdminModel = User.discriminators.admin;
  }

  await AdminModel.create({
    fullName: "Admin Test",
    email: "admin@test.com",
    password: hashedPassword,
    role: "admin",
  });

  // Login
  const loginRes = await agent.post("/api/v1/auth/login").send({
    email: "admin@test.com",
    password: "Admin123!",
  });

  expect(loginRes.status).toBe(200);

  const token =
    loginRes.body?.token ||
    loginRes.body?.data?.token ||
    loginRes.body?.accessToken ||
    loginRes.body?.data?.accessToken;

  if (token) {
    adminToken = token;
    agent.set("Authorization", `Bearer ${adminToken}`);
  }
});

afterAll(async () => {
  // Clean up exports directory
  if (fs.existsSync(exportsDir)) {
    const files = fs.readdirSync(exportsDir);
    files.forEach((file) => {
      fs.unlinkSync(path.join(exportsDir, file));
    });
  }

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await SecurityLog.deleteMany({});
});

describe("Core Security Metrics Tests", () => {
  const createTestLogs = async () => {
    return await SecurityLog.create([
      {
        attemptType: "LOGIN_FAILED",
        count: 3,
        officerName: "Officer One",
        success: false,
        timeOfAttempt: new Date(),
      },
      {
        attemptType: "LOGIN_SUCCESS",
        count: 1,
        officerName: "Officer Two",
        success: true,
        timeOfAttempt: new Date(),
      },
    ]);
  };

  it("should get security logs", async () => {
    await createTestLogs();
    const res = await agent.get("/api/v1/admin/security");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reports.length).toBe(2);
  });

  it("should support pagination", async () => {
    await createTestLogs();
    const res = await agent.get("/api/v1/admin/security").query({ limit: 1 });
    expect(res.status).toBe(200);
    expect(res.body.reports.length).toBe(1);
  });

  it("should filter by failed attempts", async () => {
    await createTestLogs();
    const res = await agent
      .get("/api/v1/admin/security")
      .query({ failedOnly: "true" });
    expect(res.status).toBe(200);
    expect(
      res.body.reports.every((r) => r.attemptType === "LOGIN_FAILED")
    ).toBe(true);
  });

  it("should export security logs as JSON", async () => {
    await createTestLogs();
    const res = await agent
      .get("/api/v1/admin/security/export")
      .query({ format: "json" });

    console.log("Export JSON response:", {
      status: res.status,
      type: res.body?.type,
      hasDownloadUrl: !!res.body?.downloadUrl,
      hasData: !!res.body?.data,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    if (process.env.NODE_ENV === "test") {
      // In test environment, we should get file type
      expect(res.body.type).toBe("base64");
      // expect(res.body.downloadUrl).toMatch(
      //   /^\/exports\/security_logs_\d+\.json$/
      // );
    }
  });

  it("should export security logs as Excel", async () => {
    await createTestLogs();
    const res = await agent
      .get("/api/v1/admin/security/export")
      .query({ format: "excel" });

    console.log("Export Excel response:", {
      status: res.status,
      type: res.body?.type,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.type).toBe("base64");
  });

  it("should download exported JSON file in test environment", async () => {
    // Skip if not in test environment
    if (process.env.NODE_ENV !== "test") {
      console.log("Skipping download test - not in test environment");
      return;
    }

    await createTestLogs();

    // First export a file
    const exportRes = await agent
      .get("/api/v1/admin/security/export")
      .query({ format: "json" });

    expect(exportRes.status).toBe(200);
    expect(exportRes.body.type).toBe("base64");

    // // Extract filename from downloadUrl
    // const filename = exportRes.body.downloadUrl.split("/").pop();

    // // Verify file exists locally
    // const filePath = path.join(exportsDir, filename);
    // expect(fs.existsSync(filePath)).toBe(true);

    // // Now download the file via the API
    // const downloadRes = await agent.get(
    //   `/api/v1/admin/security/download/${filename}`
    // );

    // console.log("Download response status:", downloadRes.status);

    // if (downloadRes.status === 500) {
    //   console.log("Download error:", downloadRes.body);
    // }

    // expect(downloadRes.status).toBe(200);
    // expect(downloadRes.headers["content-type"]).toContain("application/json");
    // expect(downloadRes.headers["content-disposition"]).toContain(filename);

    // This test is modified b/c the logic for downloading is changed making it send ing base 64 for all cases 
  });
});

describe("Authorization Tests", () => {
  it("should require authentication for security endpoints", async () => {
    const res = await request(app).get("/api/v1/admin/security");
    expect([401, 403]).toContain(res.status);
  });

  it("should require authentication for export endpoint", async () => {
    const res = await request(app).get("/api/v1/admin/security/export");
    expect([401, 403]).toContain(res.status);
  });

  it("should require authentication for download endpoint", async () => {
    const res = await request(app).get(
      "/api/v1/admin/security/download/test.json"
    );
    expect([401, 403]).toContain(res.status);
  });
});

describe("Error Handling", () => {
  it("should handle invalid filename in download", async () => {
    const res = await agent.get("/api/v1/admin/security/download/../test.json");
    expect([400, 404, 500]).toContain(res.status);
  });

  it("should handle non-existent file in download", async () => {
    const res = await agent.get(
      "/api/v1/admin/security/download/nonexistent.json"
    );
    expect(res.status).toBe(404);
  });
});
