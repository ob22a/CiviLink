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
import AppointmentCounter from "../src/models/AppointmentCounter.js";

import bcrypt from "bcryptjs";

jest.setTimeout(30000);

describe("Vital Application Approval – Concurrency", () => {
  let officerAgent;
  let officerId;
  let citizenId;
  const APPLICATION_COUNT = 50; // intentionally > single slot capacity (20)

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Officer.deleteMany({}),
      Application.deleteMany({}),
    //   Certificate.deleteMany({}),
      AppointmentCounter.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash("Password123!", 10);

    /* -------- Create Citizen -------- */
    const citizen = await User.create({
      fullName: "Test Citizen",
      email: "citizen@test.com",
      password: hashedPassword,
      confirmPassword: hashedPassword,
      acceptTerms: true,
    });

    citizenId = citizen._id;

    /* -------- Create Approver Officer -------- */
    const officerUser = await Officer.create({
      fullName: "Officer One",
      email: "officer@civilink.com",
      password: hashedPassword,
      role: "officer",
      department: "approver",
      subcity: "Bole",
    });

    officerId = officerUser._id;

    /* -------- Create Many Vital Applications -------- */
    const applications = [];

    for (let i = 0; i < APPLICATION_COUNT; i++) {
      const citizen = await User.create({
        fullName: `Citizen ${i}`,
        email: `citizen${i}@test.com`,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        acceptTerms: true,
      });

      applications.push({
        applicant: citizen._id,
        status: "pending",
        category: "VITAL",
        type: "birth",
        formData: {
          birth: {
            child: {
              firstName: "Baby",
              lastName: `Test${i}`,
              gender: "Male",
              date: "01/15/2025",
              place: "St. Mary Hospital",
            },
            mother: {
              firstName: "Jane",
              lastName: "Doe",
              date: "05/15/1992",
              nationality: "Ethiopian",
            },
            father: {
              firstName: "John",
              lastName: "Doe",
              date: "03/20/1990",
              nationality: "Ethiopian",
            },
            medicalFacility: {
              facilityName: "St. Mary Hospital",
              address: "Addis Ababa",
            },
          },
          subcity: "Bole",
        },
        assignedOfficer: officerId,
      });
    }

    await Application.insertMany(applications);

    /* -------- Login Officer -------- */
    officerAgent = request.agent(app);
    await officerAgent
      .post("/api/v1/auth/login")
      .send({ email: "officer@civilink.com", password: "Password123!" });
  });

  /* ---------------- CONCURRENCY TEST ---------------- */

  it("should safely approve many applications concurrently without slot overflow", async () => {
    const apps = await Application.find({ status: "pending" });

    const requests = apps.map((app) =>
      officerAgent.post(
        `/api/v1/vital/birth/applications/${app._id}/approve`
      )
    );

    const responses = await Promise.all(requests);

    /* -------- All should succeed -------- */
    responses.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    /* -------- DB Assertions -------- */
    const approvedApps = await Application.find({ status: "approved" });
    expect(approvedApps.length).toBe(APPLICATION_COUNT);

    /* -------- Certificates Generated -------- */
    const certificates = await Certificate.find({});
    expect(certificates.length).toBe(APPLICATION_COUNT);

    certificates.forEach((cert) => {
      expect(cert.appointment).toBeDefined();
      expect(cert.appointment.date).toBeTruthy();
      expect(cert.appointment.slot).toBeTruthy();
    });

    /* -------- Slot Safety Check -------- */
    const counters = await AppointmentCounter.find({ officerId });

    counters.forEach((counter) => {
      expect(counter.count).toBeLessThanOrEqual(20);
    });
  });
});
