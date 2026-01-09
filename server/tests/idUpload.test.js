// tests/idUpload.test.js
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import mongoose from "mongoose";

// Import the mocked modules
import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import FaydaId from "../src/models/faydaIdSchema.js";
import KebeleId from "../src/models/kebeleIdSchema.js";
import connectTestDB from "../config/testDB.js";

// Increase timeout for async operations
jest.setTimeout(60000);

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear all collections before each test
  await User.deleteMany({});
  await FaydaId.deleteMany({});
  await KebeleId.deleteMany({});
  
  // Reset all mocks
  jest.clearAllMocks();
});

describe("ID Upload API", () => {
  let testUserId;
  const testUserData = {
    fullName: "Test User",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    acceptTerms: true,
  };

  describe("GET /api/v1/user/id/data - ID Upload Status", () => {
    it("should return NONE when no IDs are uploaded", async () => {
      // Register a test user
      await request(app)
        .post("/api/v1/auth/register")
        .send(testUserData);

      const agent = request.agent(app);

      // Login to get session
      await agent.post("/api/v1/auth/login")
        .send({
          email: testUserData.email,
          password: testUserData.password,
          rememberMe: true,
        });
      
      // Get user ID
      const user = await User.findOne({ email: testUserData.email });
      testUserId = user._id;

      const res = await agent.get("/api/v1/user/id/data");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fayda).toBeNull()
      expect(res.body.data.kebele).toBeNull();
    });

    it("should return ONLY_FAYDA when only Fayda ID is uploaded", async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send(testUserData);

      const agent = request.agent(app);

      await agent.post("/api/v1/auth/login")
        .send({
          email: testUserData.email,
          password: testUserData.password,
          rememberMe: true,
        });

      const user = await User.findOne({ email: testUserData.email });
      testUserId = user._id;

      // Create a Fayda ID record for the test user
      await FaydaId.create({
        userId: testUserId,
        fullName: "Test User",
        dateOfBirth: new Date("1990-01-01"),
        sex: "M",
        expiryDate: new Date("2030-12-31"),
        fan: "FAN123456789"
      });

      const res = await agent.get("/api/v1/user/id/data");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fayda.userId?.toString()).toBe(testUserId?.toString());
      expect(res.body.data.kebele).toBeNull();
    });

    it("should return ONLY_KEBELE when only Kebele ID is uploaded", async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send(testUserData);

      const agent = request.agent(app);

      await agent.post("/api/v1/auth/login")
        .send({
          email: testUserData.email,
          password: testUserData.password,
          rememberMe: true,
        });

      const user = await User.findOne({ email: testUserData.email });
      testUserId = user._id;

      // Create a Kebele ID record for the test user
      await KebeleId.create({
        userId: testUserId,
        fullName: "Test User",
        dateOfBirth: new Date("1990-01-01"),
        sex: "F",
        expiryDate: new Date("2030-12-31"),
        idNumber: "KEB123456789"
      });

      const res = await agent.get("/api/v1/user/id/data");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kebele.userId?.toString()).toBe(testUserId?.toString());
      expect(res.body.data.fayda).toBeNull();
    });

    it("should return BOTH when both IDs are uploaded", async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send(testUserData);

      const agent = request.agent(app);

      await agent.post("/api/v1/auth/login")
        .send({
          email: testUserData.email,
          password: testUserData.password,
          rememberMe: true,
        });

      const user = await User.findOne({ email: testUserData.email });
      testUserId = user._id;

      // Create both ID records for the test user
      await FaydaId.create({
        userId: testUserId,
        fullName: "Test User",
        dateOfBirth: new Date("1990-01-01"),
        sex: "M",
        expiryDate: new Date("2030-12-31"),
        fan: "FAN123456789"
      });

      await KebeleId.create({
        userId: testUserId,
        fullName: "Test User",
        dateOfBirth: new Date("1990-01-01"),
        sex: "M",
        expiryDate: new Date("2030-12-31"),
        idNumber: "KEB123456789"
      });

      const res = await agent.get("/api/v1/user/id/data");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fayda.userId?.toString()).toBe(testUserId?.toString());
      expect(res.body.data.kebele.userId?.toString()).toBe(testUserId?.toString());
    });

    it("should return 401 without authentication token", async () => {
      const res = await request(app).get("/api/v1/user/id/data");

      expect(res.status).toBe(401);
    });
  });
});