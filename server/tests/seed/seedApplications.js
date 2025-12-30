import Application from "../../src/models/Application.js";
import User from "../../src/models/User.js";
import Officer from "../../src/models/Officer.js";
import { faker } from '@faker-js/faker';

const categories = ["TIN", "VITAL"];
const types = ["birth", "marriage"];

export async function seedApplications(count = 100) {
    console.log(`Seeding ${count} applications...`);
    
    // Define these outside so the catch block can access the last attempted values
    let currentCreated = null;
    let currentNow = null;

    try {
        const citizens = await User.find({ role: 'citizen' });
        const officers = await Officer.find({ department: 'approver', onLeave: false });

        if (citizens.length === 0 || officers.length === 0) {
            throw new Error(`Cannot seed applications: ${citizens.length} citizens and ${officers.length} officers found. Run user seeders first!`);
        }

        const applications = [];
        const officerWorkloadMap = {};

        for (let i = 0; i < count; i++) {
            const applicant = faker.helpers.arrayElement(citizens);
            const assignedOfficer = faker.helpers.arrayElement(officers);
            const category = faker.helpers.arrayElement(categories);

            const statusRoll = Math.random();
            let status;
            const faydaUploaded = faker.datatype.boolean();
            const kebeleUploaded = faker.datatype.boolean();

            if (faydaUploaded && kebeleUploaded && statusRoll < 0.6) status = "approved";
            else if ((!faydaUploaded || !kebeleUploaded) || (statusRoll < 0.7 && statusRoll > 0.6)) status = "rejected";
            else status = "pending";

            currentNow = new Date();
            currentCreated = faker.date.between({
                from: new Date(currentNow.getTime() - (365 * 24 * 60 * 60 * 1000)), 
                to: new Date(currentNow.getTime() - (24 * 60 * 60 * 1000)) // Min 1 day old        
            });

            const updated = faker.date.between({
                from: new Date(currentCreated.getTime() + 1000), // Min 1 second after created
                to: currentNow
            });

            applications.push({
                applicant: applicant._id,
                category,
                type: category === "VITAL" ? faker.helpers.arrayElement(types) : null,
                status: status,
                assignedOfficer: assignedOfficer._id,
                formData: { 
                    notes: faker.lorem.sentences(2) 
                },
                requiredIDs: { 
                    kebele: kebeleUploaded, 
                    fayda: faydaUploaded 
                },
                rejectionReason: status === "rejected" ? faker.lorem.sentence() : null,
                createdAt: currentCreated,
                updatedAt: updated
            });

            if (status === "pending") {
                const officerIdStr = assignedOfficer._id.toString();
                officerWorkloadMap[officerIdStr] = (officerWorkloadMap[officerIdStr] || 0) + 1;
            }
        }

        await Application.insertMany(applications);

        const updatePromises = Object.entries(officerWorkloadMap).map(([id, load]) =>
            Officer.findByIdAndUpdate(id, { 
                $inc: { workLoad: load } 
            })
        );
        await Promise.all(updatePromises);

        console.log(`${count} applications seeded successfully`);
    } catch (error) {
        console.error("CRASH DETECTED IN SEEDER!");
        // Now these variables are accessible
        console.log("Last Created Attempt:", currentCreated);
        console.log("Last Now Attempt:", currentNow);
        console.error(error);
        throw error;
    }
}