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

/* ---------------- TEST SETUP ---------------- */

jest.setTimeout(30000);

let citizenAgent;
let officerAgent;
let officerAgent2;
let citizenId;
let officerId1;
let officerId2;
let marriageApplicationId;
let birthApplicationId;

/* -------- BIRTH FORM DATA -------- */
const birthFormData = {
  birth: {
    child: {
      firstName: "Baby",
      middleName: "Joy",
      lastName: "Smith",
      gender: "Male",
      date: "01/15/2025",
      time: "14:30",
      place: "St. Mary Hospital, Addis Ababa",
    },
    mother: {
      firstName: "Jane",
      lastName: "Smith",
      date: "05/15/1992",
      nationality: "Ethiopian",
      occupation: "Doctor",
    },
    father: {
      firstName: "John",
      lastName: "Smith",
      date: "03/20/1990",
      nationality: "Ethiopian",
      occupation: "Engineer",
    },
    medicalFacility: {
      facilityName: "St. Mary Hospital",
      attendingPhysician: "Dr. Alemayehu",
      address: "Bole Road, Addis Ababa",
    },
  },
  subcity: "Bole",
};

//MARRIAGE APPLICATION TEST DATA
const marriageFormData = {
  marriage: {
      husband: {
      applicantInformation: {
          fullName: "John Michael Doe",
          dateOfBirth: "05/15/1990", // MM/DD/YYYY
          placeOfBirth: "Addis Ababa General Hospital",
          nationality: "Ethiopian",
          address: "123 Main Street, Bole, Addis Ababa",
          phoneNumber: "0912345678", // 10-15 digits
          emailAddress: "john.doe@example.com",
      },
      witnessInformation: [
          {
          fullName: "Michael Witness",
          relationship: "Brother",
          contactNumber: "0911111111", // 10-15 digits
          address: "456 Brother Street, Kirkos, Addis Ababa",
          },
          {
          fullName: "David Bestman",
          relationship: "Friend",
          contactNumber: "0922222222", // 10-15 digits
          address: "789 Friendship Road, Arada, Addis Ababa",
          },
      ],
      },
      wife: {
      applicantInformation: {
          fullName: "Jane Elizabeth Smith",
          dateOfBirth: "08/22/1992", // MM/DD/YYYY
          placeOfBirth: "St. Mary Hospital, Addis Ababa",
          nationality: "Ethiopian",
          address: "321 Oak Avenue, Kazanchis, Addis Ababa",
          phoneNumber: "0933333333", // 10-15 digits
          emailAddress: "jane.smith@example.com",
      },
      witnessInformation: [
          {
          fullName: "Sarah Johnson",
          relationship: "Sister",
          contactNumber: "0944444444", // 10-15 digits
          address: "654 Sister Lane, Lideta, Addis Ababa",
          },
          {
          fullName: "Emily Matron",
          relationship: "Cousin",
          contactNumber: "0955555555", // 10-15 digits
          address: "987 Family Road, Nifas Silk, Addis Ababa",
          },
      ],
      },
      ceremonyDetails: {
      date: "02/14/2025", // MM/DD/YYYY
      time: "15:00", // HH:MM 24-hour format
      place: "Holy Trinity Cathedral, Arat Kilo, Addis Ababa",
      officiant: "Reverend Abraham Tesfaye",
      },
  },
  subcity:"Bole",
};

describe("VITAL Approval API", () => {
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
    await AppointmentCounter.deleteMany({});

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

    officerId1 = officerUser._id;

    const officerUser2 = await Officer.create({
      fullName: "Officer One",
      email: "officer2@civilink.com",
      password: hashedPassword,
      role: "officer",
      department: "approver",
      subcity: "Bole",
    });

    officerId2 = officerUser2._id;

    /* -------- Create VITAL Application -------- */
    const birthApplication = await Application.create({
      applicant: citizenId,
      status: "pending",
      category: "VITAL",
      type: "birth",
      formData: birthFormData,
      requiredIDs: { kebele: true, fayda: true },
      assignedOfficer: officerId1,
    });

    birthApplicationId = birthApplication._id;

    const marriageApplication = await Application.create({
      applicant: citizenId,
      status: "pending",
      category: "VITAL",
      type: "marriage",
      formData: marriageFormData,
      requiredIDs: { kebele: true, fayda: true },
      assignedOfficer: officerId1,
    });

    marriageApplicationId = marriageApplication._id;

    /* -------- Login Agents -------- */
    citizenAgent = request.agent(app);
    officerAgent = request.agent(app);
    officerAgent2 = request.agent(app);

    await citizenAgent
      .post("/api/v1/auth/login")
      .send({ email: "citizen@test.com", password: "Password123!" });

    await officerAgent
      .post("/api/v1/auth/login")
      .send({ email: "officer@civilink.com", password: "Password123!" });

    await officerAgent2
      .post("/api/v1/auth/login")
      .send({ email: "officer2@civilink.com", password: "Password123!" });
  });

  /* ---------------- TESTS ---------------- */

  describe("Approve Birth Application", () => {
    it("should return 403 if citizen tries to approve", async () => {
      const res = await citizenAgent.post(
        `/api/v1/vital/birth/applications/${birthApplicationId}/approve`
      );

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 if unassigned officer tries to approve", async () => {
      const res = await officerAgent2.post(
        `/api/v1/vital/birth/applications/${birthApplicationId}/approve`
      );

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Officer not assigned to this application");
    });

    it("should return 400 if application type is wrong", async () => {

      const res = await officerAgent.post(
        `/api/v1/vital/marriage/applications/${birthApplicationId}/approve`
      );

      console.log(res.body)

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Application type mismatch");
    });

    it("should return 404 if application does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await officerAgent.post(
        `/api/v1/vital/birth/applications/${fakeId}/approve`
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Application not found");
    });

    it("should return 409 if application is already approved", async () => {
      await Application.findByIdAndUpdate(birthApplicationId, {
        status: "approved",
      });

      const res = await officerAgent.post(
        `/api/v1/vital/birth/applications/${birthApplicationId}/approve`
      );

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Application already processed");
    });

    it("should successfully approve a birth application and create appointment certificate", async () => {
      const res = await officerAgent.post(
        `/api/v1/vital/birth/applications/${birthApplicationId}/approve`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      /* -------- DB Assertions -------- */
      const updatedApp = await Application.findById(birthApplicationId);
      expect(updatedApp.status).toBe("approved");

      const cert = await Certificate.findOne({ application: birthApplicationId });
      expect(cert).toBeTruthy();
      expect(cert.category).toBe("VITAL");
      expect(cert.type).toBe("birth");
      expect(cert.appointment).toBeDefined();
      expect(cert.fileUrl).toBeTruthy();

      const counters = await AppointmentCounter.find({});
      expect(counters.length).toBeGreaterThan(0);
    });
  });

  describe("Approve Marriage Application", () => {
    it("should return 403 if citizen tries to approve", async () => {
      const res = await citizenAgent.post(
        `/api/v1/vital/marriage/applications/${marriageApplicationId}/approve`
      );

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 if unassigned officer tries to approve", async () => {
      const res = await officerAgent2.post(
        `/api/v1/vital/marriage/applications/${marriageApplicationId}/approve`
      );

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Officer not assigned to this application");
    });

    it("should return 400 if application type is wrong", async () => {

      const res = await officerAgent.post(
        `/api/v1/vital/birth/applications/${marriageApplicationId}/approve`
      );

      console.log(res.body)

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Application type mismatch");
    });

    it("should return 404 if application does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await officerAgent.post(
        `/api/v1/vital/marriage/applications/${fakeId}/approve`
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Application not found");
    });

    it("should return 409 if application is already approved", async () => {
      await Application.findByIdAndUpdate(marriageApplicationId, {
        status: "approved",
      });

      const res = await officerAgent.post(
        `/api/v1/vital/marriage/applications/${marriageApplicationId}/approve`
      );

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Application already processed");
    });

    it("should successfully approve a marriage application and create appointment certificate", async () => {
      const res = await officerAgent.post(
        `/api/v1/vital/marriage/applications/${marriageApplicationId}/approve`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      /* -------- DB Assertions -------- */
      const updatedApp = await Application.findById(marriageApplicationId);
      expect(updatedApp.status).toBe("approved");

      const cert = await Certificate.findOne({ application: marriageApplicationId });
      expect(cert).toBeTruthy();
      expect(cert.category).toBe("VITAL");
      expect(cert.type).toBe("marriage");
      expect(cert.appointment).toBeDefined();
      expect(cert.fileUrl).toBeTruthy();

      const counters = await AppointmentCounter.find({});
      expect(counters.length).toBeGreaterThan(0);
    });
  });
});
