import User from "../../src/models/User.js";
import Officer from "../../src/models/Officer.js";
import { faker } from '@faker-js/faker';

const departments = ['approver', 'customer_support'];
const subcities = ['Kolfe Keranio', 'Nefas Silk Lafto', 'Yeka'];

export async function seedOfficers(count = 20) {
    console.log(`Promoting ${count} citizens to officers...`);
    
    // 1. Find citizens
    const citizens = await User.find({ role: 'citizen' }).limit(count);

    if (citizens.length === 0) {
        console.warn("DEBUG: No citizens found in database with role 'citizen'.");
        return;
    }

    console.log(`DEBUG: Found ${citizens.length} citizens to promote.`);

    // 2. Map and Create
    // We delete the old User and create an Officer to ensure the discriminator is set perfectly
    const promotionPromises = citizens.map(async (citizen) => {
        const citizenData = citizen.toObject();
        const officerId = citizenData._id;

        // Delete the base user document first to avoid ID conflicts
        await User.deleteOne({ _id: officerId });

        // Re-insert as an Officer
        return Officer.create({
            ...citizenData,
            role: 'officer',
            department: faker.helpers.arrayElement(departments),
            subcity: faker.helpers.arrayElement(subcities),
            onLeave: faker.helpers.maybe(() => true, { probability: 0.1 }) ?? false,
            workLoad: 0
        });
    });

    const results = await Promise.all(promotionPromises);

    // 3. Final Verification Debugging
    const verifyCount = await Officer.countDocuments();
    const approvers = await Officer.countDocuments({ department: 'approver' });
    const support = await Officer.countDocuments({ department: 'customer_support' });

    console.log(`--- PROMOTION DEBUG REPORT ---`);
    console.log(`Total Officers in DB: ${verifyCount}`);
    console.log(`Approvers: ${approvers}`);
    console.log(`Customer Support: ${support}`);
    console.log(`------------------------------`);
}