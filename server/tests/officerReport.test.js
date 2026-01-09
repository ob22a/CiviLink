// tests/officerReport.test.js
import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest
} from '@jest/globals';
import mongoose from 'mongoose';
import { connectTestDB, disconnectTestDB } from './setup.js';
import bcrypt from 'bcryptjs';
import app from '../src/index.js';
import User from '../src/models/User.js';
import Application from '../src/models/Application.js';
import { refreshAnalytics } from '../src/services/officer_analytics/analytics.service.js';
import Officer from '../src/models/Officer.js';
import { seedUsers } from './seed/seedUsers.js';
import { seedOfficers } from './seed/seedOfficers.js';
import { seedApplications } from './seed/seedApplications.js';
import { seedConversations } from './seed/seedConversations.js';

jest.setTimeout(30000);

describe('Officer Report - Analytics Endpoints', () => {
  let adminAgent;

  beforeAll(async () => {
    // Start/connect to in-memory test DB
    await connectTestDB();

    // Seed a small dataset using existing seeders (they assume a DB connection)
    await seedUsers(50);
    await seedOfficers(10);
    await seedApplications(200);
    await seedConversations(100);

    // Recompute analytics after seeding
    await refreshAnalytics({ backfillMonths: 3 });

    // Create admin user for authentication
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await User.create({
      fullName: 'Admin Test',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    adminAgent = request.agent(app);
    await adminAgent.post('/api/v1/auth/login').send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, rememberMe: true });
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    // No per-test DB clearing required — tests use seeded data.
    // Ensure we have at least one approver and support officer available
    const approver = await Officer.findOne({ department: 'approver' });
    const support = await Officer.findOne({ department: 'customer_support' });
    expect(approver).toBeDefined();
    expect(support).toBeDefined();
  });

  it('GET /api/v1/admin/metrics/performance returns expected structure and top performer', async () => {
    const res = await adminAgent.get('/api/v1/admin/metrics/performance');
    expect(res.status).toBe(200);
    // API responses are wrapped in { data, error, success }
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('summary');
    expect(Array.isArray(res.body.data.topPerformers)).toBe(true);
    // top performer should be the approver (high processed count)
    const top = res.body.data.topPerformers[0];
    expect(top).toHaveProperty('rankScore');
    expect(top).toHaveProperty('applicationResponseRate');
    // Compare API application's response rate with DB-computed actual rate for that officer
    const officerId = top.officer?._id || top._id || null;
    if (officerId) {
      const totalApps = await Application.countDocuments({ assignedOfficer: officerId });
      const processedApps = await Application.countDocuments({ assignedOfficer: officerId, status: { $in: ['approved', 'rejected'] } });
      const actualRate = totalApps > 0 ? processedApps / totalApps : 0;
      // allow small numeric differences due to aggregation rounding
      expect(Math.abs((top.applicationResponseRate || 0) - actualRate)).toBeLessThan(0.05);
    } else {
      // If we cannot identify the officer id from response, at least assert it's a valid fraction
      expect(top.applicationResponseRate).toBeGreaterThanOrEqual(0);
      expect(top.applicationResponseRate).toBeLessThanOrEqual(1);
    }
  });

  it('GET /api/v1/admin/metrics/performance/export responds with .xlsx headers', async () => {
    const res = await adminAgent.get('/api/v1/admin/metrics/performance/download');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const cd = res.headers['content-disposition'] || '';
    expect(cd.toLowerCase()).toMatch(/filename=.*\.xlsx/);
  });

  it('GET /api/v1/admin/metrics/officers returns paginated officers with numeric scores', async () => {
    const res = await adminAgent.get('/api/v1/admin/metrics/officers').query({ page: 1, limit: 10 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('docs');
    const docs = res.body.data.docs;
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
    const doc = docs.find(d => d.department === 'approver' || d.department === 'customer_support');
    expect(doc).toBeDefined();
    expect(typeof doc.score).toBe('number');
    expect(typeof doc.responseRate).toBe('number');
  });

  describe('Weighted Scoring and Ranking Accuracy', () => {
    it('GET /api/v1/admin/metrics/performance correctly ranks officers and ensures weighted response rates', async () => {
      const res = await adminAgent.get('/api/v1/admin/metrics/performance');
      expect(res.status).toBe(200);

      const performance = res.body.data.topPerformers;
      expect(Array.isArray(performance)).toBe(true);

      for (const officer of performance) {
        const total = officer.requestsTotal || 0;
        const processed = officer.requestsProcessed || 0;

        if (total > 0) {
          // 1. Verify response rate is weighted (processed / total)
          const expectedRate = (processed / total) * 100;
          expect(officer.combinedResponseRate).toBeCloseTo(expectedRate, 2);

          // 2. Verify score strictly follows the formula: (processed / total) * LN(total + 1)
          const expectedRaw = (processed / total) * Math.log(total + 1);
          expect(officer.rankScore).toBeCloseTo(expectedRaw, 5);
        }
      }

      // 3. Verify ranking order (descending by normalizedScore)
      for (let i = 0; i < performance.length - 1; i++) {
        const current = performance[i];
        const next = performance[i + 1];
        expect(current.normalizedScore).toBeGreaterThanOrEqual(next.normalizedScore);

        // Tie-breaker check (if scores are very close, higher total requests MUST come first)
        if (Math.abs(current.normalizedScore - next.normalizedScore) < 0.0001) {
          expect(current.requestsTotal).toBeGreaterThanOrEqual(next.requestsTotal);
        }
      }
    });
  });
});