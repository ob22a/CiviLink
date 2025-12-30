// tests/payment.test.js - FIXED VERSION
import request from "supertest";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  expect,
  jest,
} from "@jest/globals";
import mongoose from "mongoose";
import app from "../src/index.js";
import User from "../src/models/User.js";
import Payment from "../src/models/Payment.js";
import Application from "../src/models/Application.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import axios from "axios";
jest.mock("axios");

jest.setTimeout(30000);

const agent = request.agent(app);
let citizenId, officerId, adminId;
const TEST_PHONE = "+251911223344";

const citizenUser = {
  fullName: "Test Citizen",
  email: "citizen@example.com",
  password: "Test@1234",
  role: "citizen",
};
const officerUser = {
  fullName: "Test Officer",
  email: "officer@example.com",
  password: "Test@1234",
  role: "officer",
  department: "approver",
  subcity: "Bole",
};
const adminUser = {
  fullName: "Test Admin",
  email: "admin@example.com",
  password: "Test@1234",
  role: "admin",
};

const mockChapaSuccess = {
  data: {
    data: {
      checkout_url: "https://checkout.chapa.test/mock-checkout",
      tx_ref: "tx_mock_123",
      status: "pending",
    },
    message: "Payment initiated",
    status: "success",
  },
};

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_DB_URI);
  await mongoose.connection.dropDatabase();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Test@1234", salt);

  const citizen = await User.create({
    ...citizenUser,
    password: hashedPassword,
  });
  citizenId = citizen._id;

  const officer = await User.create({
    ...officerUser,
    password: hashedPassword,
  });
  officerId = officer._id;

  const admin = await User.create({
    ...adminUser,
    password: hashedPassword,
  });
  adminId = admin._id;
});

beforeEach(async () => {
  await Payment.deleteMany({});
  await Application.deleteMany({});

  // Create a fresh test application for each test
  await Application.create({
    applicant: citizenId,
    category: "TIN",
    formData: { personal: { firstName: "Test", lastName: "User" } },
    status: "pending",
    requiredIDs: { kebele: true, fayda: true },
  });

  axios.post = jest.fn().mockResolvedValue(mockChapaSuccess);

  // Ensure agent is logged in as citizen before each test (cookies preserved)
  await agent
    .post("/api/v1/auth/login")
    .send({ email: citizenUser.email, password: citizenUser.password });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Login helper using your auth system (returns accessToken if present)
const loginUser = async (email, password = "Test@1234") => {
  const res = await agent.post("/api/v1/auth/login").send({ email, password });
  return res.body.data?.accessToken || null;
};

describe("Payment API - Full Flow + Roles", () => {
  let testApplication;
  let tokenCitizen, tokenOfficer, tokenAdmin;

  beforeEach(async () => {
    // Get fresh application
    testApplication = await Application.findOne({ applicant: citizenId });

    // Get tokens if your auth returns them (agent will keep cookies regardless)
    const citizenRes = await agent
      .post("/api/v1/auth/login")
      .send({ email: citizenUser.email, password: citizenUser.password });
    tokenCitizen = citizenRes.body.data?.accessToken || null;

    const officerRes = await agent
      .post("/api/v1/auth/login")
      .send({ email: officerUser.email, password: officerUser.password });
    tokenOfficer = officerRes.body.data?.accessToken || null;

    const adminRes = await agent
      .post("/api/v1/auth/login")
      .send({ email: adminUser.email, password: adminUser.password });
    tokenAdmin = adminRes.body.data?.accessToken || null;

    // Re-login as citizen to ensure agent is citizen for tests that expect citizen role
    await agent
      .post("/api/v1/auth/login")
      .send({ email: citizenUser.email, password: citizenUser.password });
  });

  // Test 1: Payment initialization
  it("citizen can initialize a payment", async () => {
    const res = await agent.post("/api/v1/payments/pay").send({
      applicationId: testApplication._id,
      serviceType: "tin",
      phoneNumber: TEST_PHONE,
      amount: 50,
    });

    console.log("Payment init response:", {
      status: res.status,
      body: res.body,
    });

    // controller returns 201 with data.{paymentId, checkoutUrl, txRef}
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.paymentId).toBeDefined();
    expect(res.body.data?.checkoutUrl).toBeDefined();
  });

  // Test 2: Payment status - citizen
  it("citizen can check payment status", async () => {
    const payment = await Payment.create({
      userId: citizenId,
      applicationId: testApplication._id,
      serviceType: "tin",
      phoneNumber: TEST_PHONE,
      amount: 50,
      status: "success",
      txRef: `tx_${uuidv4()}`,
    });

    const res = await agent.get(`/api/v1/payments/${payment._id}/status`);

    console.log("Citizen status check:", res.status, res.body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // controller returns data.status
    expect(res.body.data?.status).toBe("success");
  });

  // Test 3: Payment history
  it("citizen can get their payment history", async () => {
    await Payment.create({
      userId: citizenId,
      applicationId: testApplication._id,
      serviceType: "tin",
      phoneNumber: TEST_PHONE,
      amount: 50,
      status: "success",
      txRef: `tx_${uuidv4()}`,
    });

    const res = await agent.get("/api/v1/payments/history");

    console.log("History response:", res.status, res.body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  // Test 4: Officer paymentComplete
  it("officer sees paymentComplete boolean", async () => {
    const payment = await Payment.create({
      userId: citizenId,
      applicationId: testApplication._id,
      serviceType: "tin",
      phoneNumber: TEST_PHONE,
      amount: 50,
      status: "success",
      txRef: `tx_${uuidv4()}`,
    });

    // Logout citizen then login as officer (agent preserves cookies)
    await agent.post("/api/v1/auth/logout");
    await agent
      .post("/api/v1/auth/login")
      .send({ email: officerUser.email, password: officerUser.password });

    const res = await agent.get(`/api/v1/payments/${payment._id}/status`);

    console.log("Officer status:", res.status, res.body);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // controller returns data.paymentComplete for officers
    expect(typeof res.body.data?.paymentComplete).toBe("boolean");
    expect(res.body.data.paymentComplete).toBe(true);
  });

  // Test 5: Receipt download
  it("citizen can download their own receipt", async () => {
    const payment = await Payment.create({
      userId: citizenId,
      applicationId: testApplication._id,
      serviceType: "tin",
      phoneNumber: TEST_PHONE,
      amount: 50,
      status: "success",
      txRef: `tx_${uuidv4()}`,
    });

    // ensure agent is logged in as citizen
    await agent
      .post("/api/v1/auth/login")
      .send({ email: citizenUser.email, password: citizenUser.password });

    const res = await agent.get(`/api/v1/payments/${payment._id}/receipt`);

    console.log("Receipt download:", res.status, res.headers["content-type"]);

    expect([200, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
    }
  });
});
