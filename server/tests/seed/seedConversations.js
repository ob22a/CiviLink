import Conversation from "../../src/models/Conversation.js";
import User from "../../src/models/User.js";
import Officer from "../../src/models/Officer.js";
import { faker } from '@faker-js/faker';

const statuses = ["pending", "assigned", "closed"];

export async function seedConversations(count = 100) {
    console.log(`Seeding ${count} conversations...`);

    try {
        const citizens = await User.find({ role: 'citizen' });
        // Fallback check: try to find customer support, but take any officer if none exist
        let officers = await Officer.find({ department: 'customer_support', onLeave: false });
        
        if (officers.length === 0) {
            console.log("No 'customer_support' officers found, falling back to all available officers.");
            officers = await Officer.find({ onLeave: false });
        }

        if (citizens.length === 0 || officers.length === 0) {
            throw new Error(`Insufficient data: ${citizens.length} citizens, ${officers.length} officers found.`);
        }

        const conversations = [];
        const officerWorkloadMap = {};

        for (let i = 0; i < count; i++) {
            const citizen = faker.helpers.arrayElement(citizens);
            const officer = faker.helpers.arrayElement(officers);
            
            // Fix: Define 'now' inside the loop
            const now = new Date();

            const createdAt = faker.date.between({
                from: new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)), 
                to: new Date(now.getTime() - (24 * 60 * 60 * 1000))        
            });

            // Fix: Use 'createdAt' instead of 'created'
            const updatedAt = faker.date.between({
                from: new Date(createdAt.getTime() + 1000),
                to: now
            });

            const hasResponse = faker.datatype.boolean({ probability: 0.8 });
            const status = hasResponse ? "closed" : "pending";

            conversations.push({
                citizenId: citizen._id,
                officerId: officer._id,
                subject: faker.lorem.sentence(),
                citizenMessage: faker.lorem.sentences(2),
                officerMessage: hasResponse ? faker.lorem.sentences(2) : null,
                read: hasResponse,
                status: status,
                createdAt: createdAt,
                updatedAt: updatedAt
            });

            if (status !== "closed") {
                const officerIdStr = officer._id.toString();
                officerWorkloadMap[officerIdStr] = (officerWorkloadMap[officerIdStr] || 0) + 1;
            }
        }

        await Conversation.insertMany(conversations);

        const updatePromises = Object.entries(officerWorkloadMap).map(([id, load]) =>
            Officer.findByIdAndUpdate(id, { $inc: { workLoad: load } })
        );
        await Promise.all(updatePromises);

        console.log(`${count} conversations seeded and workloads updated`);
    } catch (error) {
        console.error("CRASH IN CONVERSATION SEEDER:");
        console.error(error.message);
        throw error;
    }
}