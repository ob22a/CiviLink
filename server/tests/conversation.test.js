import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
    jest,
} from '@jest/globals';

import app from '../src/index.js';
import User from '../src/models/User.js';
import Officer from '../src/models/Officer.js';
import Conversation from '../src/models/Conversation.js';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

jest.setTimeout(60000);

let citizenAgent;
let officerAgent;
let otherCitizenAgent;
let otherOfficerAgent;

let citizenUser;
let officerUser;
let otherCitizenUser;
let otherOfficerUser;

const hashedPassword = await bcrypt.hash("Password123!", 10);

const citizenData = {
    fullName: 'Test Citizen',
    email: 'citizen_chk@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    acceptTerms: true
};

const officerData = {
    fullName: 'Test Officer',
    email: 'officer_chk@test.com',
    password: hashedPassword,
    role: 'officer',
    department: 'customer_support',
    subcity: 'subcityA'
};

const otherCitizenData = {
    fullName: 'Other Citizen',
    email: 'other_citizen_chk@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    acceptTerms: true
};

const otherOfficerData = {
    fullName: 'Other Officer',
    email: 'other_officer_chk@test.com',
    password: hashedPassword,
    role: 'officer',
    department: 'customer_support',
    subcity: 'subcityB'
};

beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI);
    console.log('Connected to test database');

    await mongoose.connection.dropDatabase();
    console.log("Cleared database");

    // 3. Create Agents
    citizenAgent = request.agent(app);
    officerAgent = request.agent(app);
    otherCitizenAgent = request.agent(app);
    otherOfficerAgent = request.agent(app);

    // 4. Register/Create and Login Users

    // Citizen
    await citizenAgent.post('/api/v1/auth/register').send(citizenData);
    citizenUser = await User.findOne({ email: citizenData.email });
    console.log("Citizen logged in");

    officerUser = new Officer(officerData);
    await officerUser.save();
    console.log("Officer created");

    await officerAgent.post('/api/v1/auth/login').send({
        email: officerData.email,
        password: "Password123!",
        rememberMe: true
    });
    console.log("Officer logged in");

    await otherCitizenAgent.post('/api/v1/auth/register').send(otherCitizenData);
    otherCitizenUser = await User.findOne({ email: otherCitizenData.email });

    otherOfficerUser = new Officer(otherOfficerData);
    await otherOfficerUser.save();
    console.log("Other Officer created")

    await otherOfficerAgent.post('/api/v1/auth/login').send({
        email: otherOfficerData.email,
        password: "Password123!",
        rememberMe: true
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Conversation System', () => {
    let conversationId;

    it('should allow a citizen to start a chat and assign it to an officer in the same subcity', async () => {
        const res = await citizenAgent
            .post('/api/v1/chats')
            .send({
                subcity: 'subcityA',
                subject: 'Road Issue',
                message: 'There is a pothole.'
            });

        if (res.status !== 201) {
            console.log("Create Conversation Error:", JSON.stringify(res.body, null, 2));
        }
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('conversationId');

        conversationId = res.body.data.conversationId;

        // Verify DB assignment
        const conversation = await Conversation.findById(conversationId);
        expect(conversation).not.toBeNull();
        expect(conversation.officerId.toString()).toBe(officerUser._id.toString());
    });


    it('should allow the assigned officer to retrieve their conversations', async () => {
        const res = await officerAgent.get('/api/v1/chats');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const conversations = res.body.data;
        const exists = conversations.some(c => c._id === conversationId);
        expect(exists).toBe(true);
    });

    it('should not allow an officer from a different subcity to see the conversation', async () => {
        const res = await otherOfficerAgent.get('/api/v1/chats');
        expect(res.status).toBe(200);
        const conversations = res.body.data;
        const exists = conversations.some(c => c._id === conversationId);
        expect(exists).toBe(false);
    });

    it('should allow assigned officer to read messages of the conversation', async () => {
        const res = await officerAgent.get(`/api/v1/chats/${conversationId}`);
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(conversationId);
    });

    it('should allow the citizen to read messages of their conversation', async () => {
        const res = await citizenAgent.get(`/api/v1/chats/${conversationId}`);
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(conversationId);
    });

    it('should not allow a different citizen to read the conversation', async () => {
        const res = await otherCitizenAgent.get(`/api/v1/chats/${conversationId}`);
        // Middleware checks access.
        expect(res.status).toBe(403);
    });

    it('should not allow a different officer to read the conversation', async () => {
        const res = await otherOfficerAgent.get(`/api/v1/chats/${conversationId}`);
        expect(res.status).toBe(403);
    });

    it('should allow the assigned officer to post a message', async () => {
        const res = await officerAgent
            .post(`/api/v1/chats/${conversationId}`)
            .send({
                messageContent: 'I will handle this.'
            });

        expect(res.status).toBe(200);

        // Verify update
        const conv = await Conversation.findById(conversationId);
        expect(conv.officerMessage).toBe('I will handle this.');
    });

    it('should not allow a different officer to post a message', async () => {
        const res = await otherOfficerAgent
            .post(`/api/v1/chats/${conversationId}`)
            .send({
                messageContent: 'I should not be here.'
            });

        expect(res.status).toBe(403);
    });

    it('should allow the assigned officer to mark conversation as read', async () => {
        const res = await officerAgent
            .patch(`/api/v1/chats/${conversationId}/read`);

        expect(res.status).toBe(200);

        const conv = await Conversation.findById(conversationId);
        expect(conv.read).toBe(true);
    });

    it('should not allow a different officer to mark conversation as read', async () => {
        const res = await otherOfficerAgent
            .patch(`/api/v1/chats/${conversationId}/read`);

        expect(res.status).toBe(403);
    });
});
