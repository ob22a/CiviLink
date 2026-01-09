import request from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import app from "../src/index.js";
import User from "../src/models/User.js";
import FaydaId from "../src/models/faydaIdSchema.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

describe("User Controller Tests with Agent", () => {
  let agent;
  let userId;

  beforeAll(async () => {
    console.log("Setting up test environment...");
    
    await mongoose.connect(process.env.TEST_DB_URI);
    console.log("Connected to test database");

    await mongoose.connection.dropDatabase();
    console.log("Test database cleared");

    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      fullName: "testuser",
      email: "test@example.com",
      password: hashedPassword
    });
    console.log("User Created")
    
    userId = user._id;

    agent = request.agent(app);

    const res = await agent
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    if (res.body.token) {
      agent.auth(res.body.token, { type: 'bearer' });
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await FaydaId.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /info", () => {
    it("should fetch user info when authenticated via agent", async () => {
      const res = await agent.get("/api/v1/user/profile");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("test@example.com");
    });
  });

  describe("PATCH /change-password", () => {
    it("should change password successfully", async () => {
      const res = await agent
        .patch("/api/v1/user/change-password")
        .send({
          currentPassword: "password123",
          confirmPassword: "newpassword123",
          newPassword: "newpassword123"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Password changed successfully");
    });

    it("should fail if passwords do not match", async () => {
      const res = await agent
        .patch("/api/v1/user/change-password")
        .send({
          currentPassword: "password123",
          confirmPassword: "wrongmatch",
          newPassword: "newpassword123"
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("DELETE /:idType", () => {
    beforeEach(async () => {
      await FaydaId.deleteMany({ userId });
      await FaydaId.create({
        userId: userId,
        fullName: "Test User",
        dateOfBirth: new Date("1990-01-01"),
        sex: "M",
        expiryDate: new Date("2030-01-01"),
        fan: "123456789"
      });
    });

    it("should delete fayda ID info successfully", async () => {
      const res = await agent.delete("/api/v1/user/id/fayda");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("fayda information deleted");

      const check = await FaydaId.findOne({ userId });
      expect(check).toBeNull();
    });

    it("should return 404 if idType record doesn't exist", async () => {
      await FaydaId.deleteOne({ userId });

      const res = await agent.delete("/api/v1/user/id/fayda");

      expect(res.statusCode).toBe(404);
    });
  });
});