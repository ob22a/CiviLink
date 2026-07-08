// tests/auth.test.js
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
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../src/index.js"; // your Express app
import User from "../src/models/User.js";
import connectTestDB from "../config/testDB.js";

dotenv.config();

// Increase Jest timeout for async operations
jest.setTimeout(60000);

beforeAll(async () => {
  console.log("NODE_ENV in tests:", process.env.NODE_ENV); // should print "test"
  await connectTestDB();
});

afterAll(async () => {
  // await mongoose.connection.dropDatabase(); // clean test DB
  await mongoose.connection.close(); // close connection
});

// Clean users collection before each test
beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth API", () => {
  const userData = {
    fullName: "Test User",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    acceptTerms: true,
  };

  it("Register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register") // updated route
      .send(userData);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(userData.email);
  });

  it("Reject registration with invalid email", async () => {
    const invalidData = { ...userData, email: "invalidemail" };
    const res = await request(app)
      .post("/api/v1/auth/register") // updated route
      .send(invalidData);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("Login with correct credentials", async () => {
    await request(app).post("/api/v1/auth/register").send(userData);

    const res = await request(app)
      .post("/api/v1/auth/login") // updated route
      .send({
        email: userData.email,
        password: userData.password,
        rememberMe: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(userData.email);
  });

  it("Reject login with wrong password", async () => {
    await request(app).post("/api/v1/auth/register").send(userData);

    const res = await request(app)
      .post("/api/v1/auth/login") // updated route
      .send({
        email: userData.email,
        password: "WrongPass123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("Refresh token returns new access token", async () => {
    await request(app).post("/api/v1/auth/register").send(userData);
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
      rememberMe: true,
    });

    const res = await agent.post("/api/v1/auth/refresh-token"); // updated route
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("Logout clears cookies", async () => {
    const agent = request.agent(app);
    await agent.post("/api/v1/auth/register").send(userData);

    await agent.post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
      rememberMe: true,
    });

    const res = await agent.post("/api/v1/auth/logout"); // updated route
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
