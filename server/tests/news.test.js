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
import News from "../src/models/News.js";
import Officer from "../src/models/Officer.js";
import User from "../src/models/User.js";
import Notification from "../src/models/Notification.js";
import { connectTestDB, disconnectTestDB } from "./setup.js";
import { seedNews } from "./seed/seedNews.js";
import { assignNewsOfficer } from "../src/jobs/assignNewsOfficer.js";

describe("News API", () => {
    let officerAgent;
    let officerId;

    beforeAll(async () => {
        await connectTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await News.deleteMany({});
        await Officer.deleteMany({});
        await User.deleteMany({});
        await Notification.deleteMany({});

        const hashed = await bcrypt.hash("password123", 10);
        const officer = new Officer({
            fullName: "News Officer",
            email: "news.officer@example.com",
            password: hashed,
            role: "officer",
            department: "approver",
            writeNews: true,
        });
        await officer.save();
        officerId = officer._id;

        officerAgent = request.agent(app);
        await officerAgent
            .post("/api/v1/auth/login")
            .send({ email: "news.officer@example.com", password: "password123" });
    });

    it("POST /api/v1/officer/news/upload-url - returns signed url and path", async () => {
        const res = await officerAgent
            .post("/api/v1/officer/news/upload-url")
            .send({ fileName: "test-image.png" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("uploadUrl");
        expect(res.body).toHaveProperty("publicStoragePath");
    });

    it("GET /api/v1/officer/news/latest - returns latest news with image virtuals", async () => {
        await seedNews(3);
        const res = await officerAgent.get("/api/v1/officer/news/latest");
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThanOrEqual(3);
        
        // Validate Virtual: check if imageUrl exists in the first item
        if (res.body.data[0].headerImageUrl) {
            expect(res.body.data[0]).toHaveProperty("fullImageUrl");
            expect(res.body.data[0].fullImageUrl).toContain("supabase.co");
        }
    });

    it("POST /api/v1/officer/news - creates news with imagePath", async () => {
        const payload = { 
            title: "Test News", 
            content: "Content of test news",
            imagePath: "uploads/test-image.png" // Added imagePath to match your new logic
        };
        const res = await officerAgent.post("/api/v1/officer/news").send(payload);
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it("GET /api/v1/officer/news/latest - returns latest news", async () => {
        await seedNews(3);
        const res = await officerAgent.get("/api/v1/officer/news/latest");
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it("POST /api/v1/officer/news - creates news when officer has permission", async () => {
        const payload = { title: "Test News", content: "Content of test news" };
        const res = await officerAgent.post("/api/v1/officer/news").send(payload);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it("POST /api/v1/officer/news - denies creation when officer lacks write permission", async () => {
        const hashed = await bcrypt.hash("password123", 10);
        const limited = new Officer({
            fullName: "Limited Officer",
            email: "limited.officer@example.com",
            password: hashed,
            department:"approver",
            writeNews: false,
        });
        await limited.save();

        const limitedAgent = request.agent(app);
        await limitedAgent
            .post("/api/v1/auth/login")
            .send({ email: "limited.officer@example.com", password: "password123" });

        const res = await limitedAgent.post("/api/v1/officer/news").send({ title: "X", content: "Y" });
        expect(res.status).toBe(403);
    });

    it("PATCH /api/v1/officer/news/:id - edits news when authorized", async () => {
        const [created] = await seedNews(1, officerId);
        const res = await officerAgent.patch(`/api/v1/officer/news/${created._id}`).send({ title: "Updated" });
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated");
    });

    it("DELETE /api/v1/officer/news/:id - deletes news when authorized", async () => {
        const [created] = await seedNews(1, officerId);
        const res = await officerAgent.delete(`/api/v1/officer/news/${created._id}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe("News Officer Assignment Cron Job", () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterAll(async ()=>{
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await Officer.deleteMany({});
        await User.deleteMany({});
        await Notification.deleteMany({});
    });

    it("should assign a news writer when none exists", async () => {
        const officer1 = await Officer.create({ fullName: "Officer One", email: "one@test.com", workLoad: 10, department:"approver" });
        await Officer.create({ fullName: "Officer Two", email: "two@test.com", workLoad: 5, department:"customer_support" });

        const newWriter = await assignNewsOfficer();
        expect(newWriter).not.toBeNull();
        expect(newWriter.workLoad).toBe(5); // The one with the lowest workload

        const writerCount = await Officer.countDocuments({ writeNews: true });
        expect(writerCount).toBe(1);
    });

    it("should rotate the news writer and create a notification", async () => {
        const officer1 = await Officer.create({ fullName: "Officer One", email: "one@test.com", writeNews: true, workLoad: 10, department:"customer_support" });
        const officer2 = await Officer.create({ fullName: "Officer Two", email: "two@test.com", writeNews: false, workLoad: 5, department:"customer_support" });

        const newWriter = await assignNewsOfficer();
        expect(newWriter).not.toBeNull();
        expect(newWriter._id.toString()).toBe(officer2._id.toString());

        const oldWriter = await Officer.findById(officer1._id);
        expect(oldWriter.writeNews).toBe(false);

        const notification = await Notification.findOne({ recipient: officer2._id });
        expect(notification).not.toBeNull();
        expect(notification.title).toBe("News Assignment");
    });
});