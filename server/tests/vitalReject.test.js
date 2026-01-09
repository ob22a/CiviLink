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
  jest
} from "@jest/globals";

import mongoose from "mongoose";
import app from "../src/index.js";

import User from "../src/models/User.js";
import Officer from "../src/models/Officer.js";
import Application from "../src/models/Application.js";

import bcrypt from "bcryptjs";

/* ---------------- TEST SETUP ---------------- */

jest.setTimeout(30000);

let citizenAgent;
let officerAgent;
let officerAgent2;
let citizenId;
let officerId;
let officerId2;
let applicationId;

describe("Vital Application Rejection API", () => {
  const birthFormData = {
    birth: {
      child: {
        firstName: "Baby",
        middleName: "Joy",
        lastName: "Smith",
        gender: "Male",
        date: "01/15/2025",
        time: "14:30",
        place: "St. Mary Hospital",
      },
      mother: {
        firstName: "Jane",
        lastName: "Smith",
        date: "05/15/1992",
        nationality: "Ethiopian",
      },
      father: {
        firstName: "John",
        lastName: "Smith",
        date: "03/20/1990",
        nationality: "Ethiopian",
      },
      medicalFacility: {
        facilityName: "St. Mary Hospital",
        address: "Bole Road",
      },
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

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    /* -------- Citizen -------- */
    const citizen = await User.create({
      fullName: "Test Citizen",
      email: "citizen@test.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      acceptTerms: true,
    });

    citizenId = citizen._id;

    /* -------- Approver Officer -------- */
    const officerUser = await Officer.create({
      fullName: "Officer One",
      email: "officer@test.com",
      password: hashedPassword,
      role: "officer",
      department: "approver",
      workLoad: 1,
      subcity: "Bole",
    });

    officerId = officerUser._id;

    const officer2 = await Officer.create({
      fullName: "Officer One",
      email: "officer2@test.com",
      password: hashedPassword,
      role: "officer",
      department: "approver",
      subcity: "Bole",
    });

    officerId2 = officer2._id;

    /* -------- Vital Application -------- */
    const application = await Application.create({
      applicant: citizenId,
      category: "VITAL",
      type: "birth",
      status: "pending",
      formData: birthFormData,
      assignedOfficer: officerId,
    });

    applicationId = application._id;

    /* -------- Login Agents -------- */
    citizenAgent = request.agent(app);
    officerAgent = request.agent(app);
    officerAgent2 = request.agent(app);

    await citizenAgent
      .post("/api/v1/auth/login")
      .send({ email: "citizen@test.com", password: "Password123!" });

    await officerAgent
      .post("/api/v1/auth/login")
      .send({ email: "officer@test.com", password: "Password123!" });
    
    await officerAgent2
      .post("/api/v1/auth/login")
      .send({ email: "officer2@test.com", password: "Password123!" });
  });

  /* ---------------- TESTS ---------------- */

  describe("Reject Vital Application", () => {
    it("should return 403 if citizen tries to reject", async () => {
      const res = await citizenAgent
        .post(`/api/v1/vital/birth/applications/${applicationId}/reject`)
        .send({ reason: "Invalid documents" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 if unassigned officer tries to reject", async () => {
        const res = await officerAgent2
        .post(`/api/v1/vital/birth/applications/${applicationId}/reject`)
        .send({ reason: "Invalid documents" });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Officer not assigned to this application");
    });

    it("should return 400 for short rejection reason", async () => {
      const res = await officerAgent
        .post(`/api/v1/vital/birth/applications/${applicationId}/reject`)
        .send({ reason: "No" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Rejection reason must be at least 5 characters long.");
    });

    it("should return 404 if application does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await officerAgent
        .post(`/api/v1/vital/birth/applications/${fakeId}/reject`)
        .send({ reason: "Invalid documents submitted" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Application not found");
    });

    it("should return 409 if application already processed", async () => {
      await Application.findByIdAndUpdate(applicationId, {
        status: "approved",
      });

      const res = await officerAgent
        .post(`/api/v1/vital/birth/applications/${applicationId}/reject`)
        .send({ reason: "Late submission" });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Application already processed");
    });

    it("should successfully reject a vital application", async () => {
      const res = await officerAgent
        .post(`/api/v1/vital/birth/applications/${applicationId}/reject`)
        .send({ reason: "Missing required birth information" });

        console.log(res.body);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedApp = await Application.findById(applicationId);
      expect(updatedApp.status).toBe("rejected");
      expect(updatedApp.rejectionReason).toBe(
        "Missing required birth information"
      );
    });
  });
});
