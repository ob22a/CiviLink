/*
Features Tested:
- assignOfficer middleware
- Officer Schema with discriminator
- Officer routes and controller methods for fetching assigned applications
- Integration of officer routes in the main application
*/

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
} from "@jest/globals";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import app from "../src/index.js";
import Officer from "../src/models/Officer.js";
import Application from "../src/models/Application.js";
import UploadedID from "../src/models/UploadedID.js";
import User from "../src/models/User.js";

describe("Officer Routes 👮 (Cookie-Based Auth)", () => {
  let officerId;
  let otherOfficerId;
  let applicationId;

  let officerAgent;
  let otherOfficerAgent;

  // TIN APPLICATION TEST DATA
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
    subCity: "Bole",
  };

  beforeAll(async () => {
    console.log("🚀 Starting Officer Routes Tests...");
    await mongoose.connect(process.env.TEST_DB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    console.log("🏁 Officer Routes Tests Completed.");
  });

  beforeEach(async () => {
    await Officer.deleteMany({});
    await Application.deleteMany({});
    await User.deleteMany({});

    console.log("🧹 Database cleared. Setting up test data...");

    // Citizen
    const citizen = new User({
      fullName: "Citizen One",
      email: "citizen1@civilink.com",
      password: await bcrypt.hash("password123", 10),
      role: "citizen",
    });
    await citizen.save();

    // Officers
    const hashedPassword = await bcrypt.hash("password123", 10);

    const officer = new Officer({
      fullName: "Officer One",
      email: "officer1@civilink.com",
      password: hashedPassword,
      role: "officer",
      department: "approver",
      subCity: "Bole",
    });
    await officer.save();
    officerId = officer._id;

    const otherOfficer = new Officer({
      fullName: "Officer Two",
      email: "officer2@civilink.com",
      password: hashedPassword,
      role: "officer",
      department: "customer_support",
      subCity: "Bole",
    });
    await otherOfficer.save();
    otherOfficerId = otherOfficer._id;

    // Authenticated agents (cookie persistence)
    officerAgent = request.agent(app);
    otherOfficerAgent = request.agent(app);

    await officerAgent
      .post("/api/v1/auth/login")
      .send({ email: "officer1@civilink.com", password: "password123" });

    await otherOfficerAgent
      .post("/api/v1/auth/login")
      .send({ email: "officer2@civilink.com", password: "password123" });

    // Application assigned to officer1
    const application = new Application({
      applicant: citizen._id,
      status: "pending",
      category: "TIN",
      formData: { tinType: "personal" },
      requiredIDs: { kebele: true, fayda: true },
      assignedOfficer: officerId,
    });

    await application.save();
    applicationId = application._id;

    console.log("📝 Application created and assigned.");
  });

  describe("Officer application access 🔐", () => {
    it("should NOT allow access to another officer's application 🚫", async () => {
      const res = await otherOfficerAgent.get(
        `/api/v1/officer/applications/${applicationId}`
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "You are not authorized to view this application"
      );
    });

    it("should allow officer to fetch their assigned application ✅", async () => {
      const res = await officerAgent.get(
        `/api/v1/officer/applications/${applicationId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(applicationId.toString());
    });

    it("should fetch all applications assigned to officer 📋", async () => {
      const res = await officerAgent.get("/api/v1/officer/applications");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]._id).toBe(applicationId.toString());
    });

    it("should create a TIN application as citizen and auto-assign officer 🆕", async () => {
      const citizenAgent = request.agent(app);

      // REGISTER (auto-login happens here)
      const registerRes = await citizenAgent
        .post("/api/v1/auth/register")
        .send({
          fullName: "Citizen Two",
          email: "citizen2@civilink.com",
          password: "Password@123",
          confirmPassword: "Password@123",
          acceptTerms: true,
        });

      const userId = registerRes.body.data.user.id;

      await UploadedID.insertMany([
        {
          user: userId,
          type: "fayda",
          imageUrl: "test-fayda.jpg",
        },
        {
          user: userId,
          type: "kebele",
          imageUrl: "test-kebele.jpg",
        },
      ]);


      expect(registerRes.status).toBe(201);

      // NOW citizen is authenticated via cookies
      const res = await citizenAgent
        .post("/api/v1/tin/applications")
        .send({
          formData: tinFormData,
          requiredIDs: { kebele: true, fayda: true },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.applicationId).toBeDefined();

      const createdApp = await Application.findById(res.body.applicationId);
      expect(createdApp).toBeDefined();
      expect(createdApp.assignedOfficer).toBeDefined();
    });

  });
});
