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

import bcrypt from "bcryptjs";

/* ---------------- TEST SETUP ---------------- */

jest.setTimeout(30000);

let citizenAgent;
let citizenId;
let otherCitizenId;
let officerId

describe("Get All Applications API", () => {

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
      fullName: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      acceptTerms: true,
    });

    citizenId = citizen._id;

    const otherCitizen = await User.create({
      fullName: "Other User",
      email: "other@example.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      acceptTerms: true,
    });

    otherCitizenId = otherCitizen._id;

    /* -------- Create Applications -------- */

    await Application.create([
      {
        applicant: citizenId,
        category: "TIN",
        status: "pending",
        formData: tinFormData,
        assignedOfficer: officerId
      },
      {
        applicant: citizenId,
        category: "VITAL",
        type: "birth",
        status: "approved",
        formData: tinFormData,
        assignedOfficer: officerId
      },
      {
        applicant: otherCitizenId,
        category: "TIN",
        status: "pending",
        formData: tinFormData,
        assignedOfficer: officerId
      },
    ]);

    /* -------- Login Agent -------- */

    citizenAgent = request.agent(app);

    await citizenAgent
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "Password123!" });
  });

  /* ---------------- TESTS ---------------- */

  describe("GET /api/v1/applications", () => {
    it("should return all applications belonging to the logged-in user", async () => {
      const res = await citizenAgent.get("/api/v1/applications");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const applications = res.body.data;

      expect(applications.length).toBe(2);

      /* -------- Ensure ownership -------- */
      applications.forEach(app => {
        expect(app).toHaveProperty("_id");
        expect(["TIN", "VITAL"]).toContain(app.category);
      });
    });

    it("should not return applications belonging to other users", async () => {
      const res = await citizenAgent.get("/api/v1/applications");

      expect(res.body.data.length).toBe(2);
    });

    it("should return only selected fields", async () => {
      const res = await citizenAgent.get("/api/v1/applications");

      const app = res.body.data[0];

      expect(app).toHaveProperty("_id");
      expect(app).toHaveProperty("category");
      expect(app).toHaveProperty("status");
      expect(app).toHaveProperty("createdAt");
      expect(app).toHaveProperty("formData");
      
      expect(app).not.toHaveProperty("assignedOfficer");
      expect(app).not.toHaveProperty("applicant");
    });
  });
});
