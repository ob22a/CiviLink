// tests/auth.test.js
import request from "supertest";
import app from "../index.js";
import User from "../models/User.js";
import { connectTestDB, disconnectTestDB } from "./setup.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Auth API", () => {
  const userData = {
    fullName: "Test User",
    email: "test@example.com",
    password: "Test1234!",
    confirmPassword: "Test1234!",
    acceptTerms: true,
  };

  test("Register a new user successfully", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe("citizen");

    const userInDB = await User.findOne({ email: userData.email });
    expect(userInDB).not.toBeNull();
    expect(userInDB.password).not.toBe(userData.password); // hashed
  });

  test("Reject registration with invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...userData, email: "invalidemail" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Login with correct credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
      rememberMe: true,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("Reject login with wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userData.email, password: "WrongPass123!" });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("Refresh token returns new access token", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
      rememberMe: true,
    });

    const cookies = loginRes.headers["set-cookie"];

    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("Logout clears cookies", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
      rememberMe: true,
    });

    const cookies = loginRes.headers["set-cookie"];

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
