import { connectDB } from './index.js';
import { seedUsers } from './seedUsers.js';
import { seedOfficers } from './seedOfficers.js';
import { seedApplications } from './seedApplications.js';
import { seedConversations } from './seedConversations.js';
import { seedNews } from './seedNews.js';
import {refreshAnalytics} from '../../src/services/officer_analytics/analytics.service.js';

// Make good estimate of how many seeds you need and then run 

async function run() {
  await connectDB();
  await seedUsers(300);          // citizens + admins
  await seedOfficers(50);
  await seedApplications(3000);
  await seedConversations(3000);
  await seedNews(50);
  await refreshAnalytics();
  console.log("All test data seeded successfully!");
  process.exit();
}

run();