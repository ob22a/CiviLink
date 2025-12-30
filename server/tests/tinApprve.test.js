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
import Officer from "../src/models/Officer.js";
import Application from "../src/models/Application.js";
import Certificate from "../src/models/certificate.js";

import bcrypt from "bcryptjs";

/* ---------------- TEST SETUP ---------------- */

jest.setTimeout(30000);

let citizenAgent;
let officerAgent;
let citizenId;
let officerId;
let applicationId;

describe("TIN Approval API", () => {

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
    await Officer.deleteMany({});
    await Application.deleteMany({});
    await Certificate.deleteMany({});

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    /* -------- Create Citizen -------- */

    const citizen = await User.create({
        fullName: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        confirmPassword: hashedPassword,
        acceptTerms: true,
    });

    citizenId = citizen._id;

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

    await Officer.create({
      fullName: "Officer One",
      email: "officer2@civilink.com",
      password: hashedPassword,
      role: "officer",
      department: "approver",
      subcity: "Bole",
    });

    /* -------- Create TIN Application -------- */
    const application = await Application.create({
        applicant: citizenId,
        status: "pending",
        category: "TIN",
        formData: tinFormData,
        requiredIDs: { kebele: true, fayda: true },
        assignedOfficer: officerId,
    });

    applicationId = application._id;

    /* -------- Login Agents -------- */
    citizenAgent = request.agent(app);
    officerAgent = request.agent(app);

    await citizenAgent
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "Password123!" });

    await officerAgent
      .post("/api/v1/auth/login")
      .send({ email: "officer1@civilink.com", password: "Password123!" });
  });

  /* ---------------- TESTS ---------------- */

  describe("Approve TIN Application", () => {
    it("should return 403 if citizen tries to approve", async () => {
      const res = await citizenAgent
        .post(`/api/v1/tin/applications/${applicationId}/approve`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 if application does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await officerAgent
        .post(`/api/v1/tin/applications/${fakeId}/approve`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Application not found");
    });

    it("should return 409 if application is already approved", async () => {
        await Application.findByIdAndUpdate(applicationId, {
            status: "approved",
        });

        const res = await officerAgent
            .post(`/api/v1/tin/applications/${applicationId}/approve`);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe("Application already processed");
    });

    it("should successfully approve a TIN application", async () => {
      const res = await officerAgent
        .post(`/api/v1/tin/applications/${applicationId}/approve`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("TIN application approved");

      /* -------- Application Assertions -------- */
      expect(res.body.application.status).toBe("approved");
      expect(res.body.application.formData.tin).toBeTruthy();

      /* -------- Certificate Assertions -------- */
      expect(res.body.certificate.category).toBe("TIN");
      expect(res.body.certificate.filePath).toBeTruthy();

      /* -------- DB Assertions -------- */
      const updatedApp = await Application.findById(applicationId);
      expect(updatedApp.status).toBe("approved");
      expect(updatedApp.formData.tin).toBeTruthy();

      const cert = await Certificate.findOne({ application: applicationId });
      expect(cert).toBeTruthy();
    });
  });
});
