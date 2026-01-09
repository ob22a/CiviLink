import User from "../../src/models/User.js";
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

export async function seedUsers(count = 50) {
    console.log(`Seeding ${count} users...`);
    const hashedStackPassword = await bcrypt.hash("Password123!", 10);
    const users = [];

    for (let i = 0; i < count; i++) {
        users.push({
            fullName: faker.person.fullName(),
            email: faker.internet.email().toLowerCase(),
            password: hashedStackPassword,
        });
    }

    await User.insertMany(users);
    console.log(`${count} users seeded`);
}