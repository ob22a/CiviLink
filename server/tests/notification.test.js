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
import app from "../src/index.js";
import { connectTestDB, disconnectTestDB } from './setup.js';
import User from '../src/models/User.js';
import Notification from '../src/models/Notification.js';
import bcrypt from 'bcryptjs';

describe('Notification API', () => {
    let agent;
    let anotherUserAgent;
    let userId;
    let anotherUserId;

    beforeAll(async () => {
        await connectTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Notification.deleteMany({});

        const hashed = await bcrypt.hash('password123', 10);
        const user = await User.create({
            fullName: 'Test User',
            email: 'test@example.com',
            password: hashed,
        });
        userId = user._id;

        const anotherUser = await User.create({
            fullName: 'Another User',
            email: 'another@example.com',
            password: hashed,
        });
        anotherUserId = anotherUser._id;

        agent = request.agent(app);
        anotherUserAgent = request.agent(app);

        await agent
            .post('/api/v1/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });

        await anotherUserAgent
            .post('/api/v1/auth/login')
            .send({ email: 'another@example.com', password: 'password123' });

        // Add more notifications for testing purposes
        await Notification.create([
            { recipient: userId, title: 'Officer Assignment', message: 'Test message 2', read: true },
            { recipient: userId, title: 'Payment Status', message: 'Test message 3', read: false },
        ]);
    });

    describe('GET /api/v1/notifications', () => {
        it('should get all notifications for a user', async () => {
            const res = await agent.get('/api/v1/notifications');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            // One from login, two manually created
            expect(res.body.data.notifications.length).toBe(3);
            expect(res.body.data.total).toBe(3);
        });

        it('should get only unread notifications', async () => {
            const res = await agent.get('/api/v1/notifications?unreadOnly=true');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            // One from login, one manually created unread
            expect(res.body.data.notifications.length).toBe(2);
            expect(res.body.data.total).toBe(2);
        });

        it('should return paginated notifications', async () => {
            const res = await agent.get('/api/v1/notifications?page=1&limit=2');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.notifications.length).toBe(2);
            expect(res.body.data.total).toBe(3);
            expect(res.body.data.page).toBe(1);
            expect(res.body.data.totalPages).toBe(2);
            expect(res.body.data.hasNextPage).toBe(true);
        });

        it('should return 401 if not authenticated', async () => {
            // Use a new agent that is not logged in
            const res = await request(app).get('/api/v1/notifications');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('PATCH /api/v1/notifications/:id/mark-read', () => {
        it('should mark a notification as read', async () => {
            const notification = await Notification.findOne({ recipient: userId, read: false });
            const res = await agent.patch(`/api/v1/notifications/${notification._id}/mark-read`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.read).toBe(true);

            const updatedNotification = await Notification.findById(notification._id);
            expect(updatedNotification.read).toBe(true);
        });

        it('should return 404 for a non-existent notification', async () => {
            const invalidId = new mongoose.Types.ObjectId();
            const res = await agent.patch(`/api/v1/notifications/${invalidId}/mark-read`);
            expect(res.statusCode).toEqual(404);
        });

        it('should return 404 when trying to mark another user\'s notification', async () => {
            const notificationOfAnotherUser = await Notification.findOne({ recipient: anotherUserId });
            const res = await agent.patch(`/api/v1/notifications/${notificationOfAnotherUser._id}/mark-read`);
            expect(res.statusCode).toEqual(404);
        });


        it('should return 400 for an invalid ID', async () => {
            const res = await agent.patch('/api/v1/notifications/invalidid/mark-read');
            expect(res.statusCode).toEqual(400);
        });

        it('should return 401 if not authenticated', async () => {
            const notification = await Notification.findOne({ recipient: userId });
            const res = await request(app).patch(`/api/v1/notifications/${notification._id}/mark-read`);
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('PATCH /api/v1/notifications/mark-all-read', () => {
        it('should mark all notifications as read', async () => {
            const res = await agent.patch('/api/v1/notifications/mark-all-read');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            // One from login, one manually created unread
            expect(res.body.data.modifiedCount).toBe(2);

            const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });
            expect(unreadCount).toBe(0);
        });

        it('should return 0 modifiedCount when no unread notifications', async () => {
            await Notification.updateMany({ recipient: userId }, { read: true });
            const res = await agent.patch('/api/v1/notifications/mark-all-read');
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.modifiedCount).toBe(0);
        });


        it('should return 401 if not authenticated', async () => {
            const res = await request(app).patch('/api/v1/notifications/mark-all-read');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('DELETE /api/v1/notifications/:id', () => {
        it('should delete a notification', async () => {
            const notification = await Notification.findOne({ recipient: userId });
            const res = await agent.delete(`/api/v1/notifications/${notification._id}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.message).toBe('Notification deleted.');

            // Mongoose has a pre-find hook that filters out documents with `deletedAt` set,
            // so use the underlying collection to fetch the raw document (bypass hooks)
            const deletedNotification = await Notification.collection.findOne({ _id: notification._id });
            expect(deletedNotification.deletedAt).not.toBeNull();
        });

        it('should return 404 for a non-existent notification', async () => {
            const invalidId = new mongoose.Types.ObjectId();
            const res = await agent.delete(`/api/v1/notifications/${invalidId}`);
            expect(res.statusCode).toEqual(404);
        });

        it('should return 404 when trying to delete another user\'s notification', async () => {
            const notificationOfAnotherUser = await Notification.findOne({ recipient: anotherUserId });
            const res = await agent.delete(`/api/v1/notifications/${notificationOfAnotherUser._id}`);
            expect(res.statusCode).toEqual(404);
        });

        it('should return 400 for an invalid ID', async () => {
            const res = await agent.delete('/api/v1/notifications/invalidid');
            expect(res.statusCode).toEqual(400);
        });

        it('should return 401 if not authenticated', async () => {
            const notification = await Notification.findOne({ recipient: userId });
            const res = await request(app).delete(`/api/v1/notifications/${notification._id}`);
            expect(res.statusCode).toEqual(401);
        });
    });
});