import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { calculateOfficerStats } from '../src/services/officer_analytics/officerStatsService.js';
import Conversation from '../src/models/Conversation.js';
import Application from '../src/models/Application.js';

dotenv.config();

async function migrate() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('❌ MONGODB_URI is not defined in .env');
        process.exit(1);
    }

    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        console.log('🔍 Finding unique months with activity...');

        const convMonths = await Conversation.aggregate([
            { $match: { updatedAt: { $exists: true } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } } } }
        ]);

        const appMonths = await Application.aggregate([
            { $match: { updatedAt: { $exists: true } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } } } }
        ]);

        const monthsSet = new Set();
        convMonths.forEach(m => monthsSet.add(m._id));
        appMonths.forEach(m => monthsSet.add(m._id));

        const sortedMonths = Array.from(monthsSet).sort();
        console.log(`📅 Found ${sortedMonths.length} months to process: ${sortedMonths.join(', ')}`);

        for (const month of sortedMonths) {
            console.log(`⚙️ Processing month: ${month}...`);
            await calculateOfficerStats(month);
            console.log(`✅ Successfully processed ${month}`);
        }

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

migrate();
