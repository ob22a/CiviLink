import request from "supertest";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

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
import app from "../src/index.js";

import User from "../src/models/User.js";
import Application from "../src/models/Application.js";
import Certificate from "../src/models/certificate.js";

import bcrypt from "bcryptjs";

/* ---------------- TEST SETUP ---------------- */

jest.setTimeout(30000);

let citizenAgent;
let otherAgent;
let citizenId;
let otherCitizenId;
let officerId;
let applicationId;

describe("Download Certificate API", () => {

  const tinFormData = {
    personal: {
      firstName: "John",
      middleName: "Michael",
      lastName: "Doe",
      dateOfBirth: "05/15/1990",
      gender: "Male",
      bankAccountNumber: "1234567890",
      FAN: "12345678",
      email: "johnMichael@email.com",
    },
    employmentDetails: {
      occupation: "Software Engineer",
      employerName: "Acme Corp",
      employerAddress: "Addis Ababa",
    },
    addressDetails: {
      streetAddress: "Bole road, Meskel Square",
      city: "Addis Ababa",
      region: "Addis Ababa",
      postalCode: 1000,
    },
    subcity: "Bole",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Application.deleteMany({});
    await Certificate.deleteMany({});

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    /* -------- Create Approver Officer -------- */

    const officerUser = await User.create({
      fullName: "Officer One",
      email: "officer1@civilink.com",
      password: hashedPassword,
      role: "officer",
      department: "approver",
      subcity: "Bole",
    });

    officerId = officerUser._id;

    /* -------- Create Users -------- */

    const citizen = await User.create({
      fullName: "Owner User",
      email: "owner@test.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      acceptTerms: true,
    });

    citizenId = citizen._id;

    const otherUser = await User.create({
      fullName: "Other User",
      email: "other@test.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      acceptTerms: true,
    });

    otherCitizenId = otherUser._id;

    /* -------- Create Application -------- */

    const application = await Application.create({
      applicant: citizenId,
      category: "TIN",
      status: "approved",
      formData: tinFormData,
      assignedOfficer: officerId
    });

    applicationId = application._id;

    /* -------- Create Certificate -------- */

    await Certificate.create({
      user: citizenId,
      application: applicationId,
      category: "TIN",
      fileUrl: "/fake/path/certificate.pdf",
      issuedBy: officerId
    });

    /* -------- Login Agents -------- */

    citizenAgent = request.agent(app);
    otherAgent = request.agent(app);

    await citizenAgent
      .post("/api/v1/auth/login")
      .send({ email: "owner@test.com", password: "Password123!" });

    await otherAgent
      .post("/api/v1/auth/login")
      .send({ email: "other@test.com", password: "Password123!" });
  });

  /* ---------------- TESTS ---------------- */

  describe("GET /api/v1/applications/:id/download", () => {
    it("should return 404 if certificate does not exist", async () => {
      await Certificate.deleteMany({});

      const res = await citizenAgent
        .get(`/api/v1/applications/${applicationId}/download`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Certificate not found");
    });

    it("should return 403 if certificate does not belong to user", async () => {
      const res = await otherAgent
        .get(`/api/v1/applications/${applicationId}/download`);

      expect(res.status).toBe(403);
      expect(res.body.message)
        .toBe("You are not authorized to access this certificate");
    });

    it("should successfully download certificate", async () => {

      const res = await citizenAgent
        .get(`/api/v1/applications/${applicationId}/download`);

      console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("File downloaded successfully!");
    });
  });
});
