import Application from "../../src/models/Application.js";
import User from "../../src/models/User.js";
import Officer from "../../src/models/Officer.js";
import { faker } from '@faker-js/faker';

const categories = ["TIN", "VITAL"];
const types = ["birth", "marriage"];

// Helper for TIN Form Data
const generateTinFormData = () => ({
  personal: {
    firstName: faker.person.firstName(),
    middleName: faker.datatype.boolean() ? faker.person.middleName() : undefined,
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toLocaleDateString(),
    gender: faker.helpers.arrayElement(["Male", "Female"]),
    bankAccountNumber: faker.finance.accountNumber(10),
    FAN: faker.string.numeric(8),
    email: faker.internet.email()
  },
  employmentDetails: {
    occupation: faker.person.jobTitle(),
    employerName: faker.datatype.boolean() ? faker.company.name() : undefined,
    employerAddress: faker.datatype.boolean() ? faker.location.city() : undefined
  },
  addressDetails: {
    streetAddress: faker.location.streetAddress(),
    city: "Addis Ababa",
    region: "Addis Ababa",
    postalCode: faker.datatype.boolean() ? 1000 : undefined
  },
  subcity: faker.helpers.arrayElement(["Bole", "Yeka", "Arada", "Kirkos"])
});

// Helper for Birth Form Data
const generateBirthFormData = () => ({
  birth: {
    child: {
      firstName: faker.person.firstName(),
      middleName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      gender: faker.helpers.arrayElement(["Male", "Female"]),
      date: faker.date.recent().toLocaleDateString(),
      time: "10:30 AM",
      place: "Black Lion Hospital"
    },
    mother: {
      firstName: faker.person.firstName("female"),
      lastName: faker.person.lastName(),
      date: faker.date.birthdate({ min: 20, max: 45, mode: 'age' }).toLocaleDateString(),
      nationality: "Ethiopian",
      occupation: faker.person.jobTitle()
    },
    father: {
      firstName: faker.person.firstName("male"),
      lastName: faker.person.lastName(),
      date: faker.date.birthdate({ min: 20, max: 50, mode: 'age' }).toLocaleDateString(),
      nationality: "Ethiopian",
      occupation: faker.person.jobTitle()
    },
    medicalFacility: {
      facilityName: "St. Paul's Hospital",
      attendingPhysician: `Dr. ${faker.person.lastName()}`,
      address: "Addis Ababa"
    }
  },
  subcity: "Bole"
});

// Helper for Marriage Form Data
const generateMarriageFormData = () => {
  const generatePartner = (sex) => ({
    applicantInformation: {
      fullName: faker.person.fullName({ sex }),
      dateOfBirth: faker.date.birthdate({ min: 21, max: 50, mode: 'age' }).toLocaleDateString(),
      placeOfBirth: "Addis Ababa",
      nationality: "Ethiopian",
      address: faker.location.streetAddress(),
      phoneNumber: faker.phone.number(),
      emailAddress: faker.internet.email()
    },
    witnessInformation: [{
      fullName: faker.person.fullName(),
      relationship: "Friend",
      contactNumber: faker.phone.number(),
      address: faker.location.city()
    }]
  });

  return {
    marriage: {
      husband: generatePartner("male"),
      wife: generatePartner("female"),
      ceremonyDetails: {
        date: faker.date.future().toLocaleDateString(),
        time: "02:00 PM",
        place: "Municipality Office",
        officiant: faker.person.fullName()
      }
    },
    subcity: "Bole"
  };
};

export async function seedApplications(count = 100) {
  console.log(`Seeding ${count} applications...`);
  let currentCreated = null;
  let currentNow = null;

  try {
    const citizens = await User.find({ role: 'citizen' });
    const officers = await Officer.find({ department: 'approver', onLeave: false });

    if (citizens.length === 0 || officers.length === 0) {
      throw new Error(`Run user seeders first!`);
    }

    const applications = [];
    const officerWorkloadMap = {};

    for (let i = 0; i < count; i++) {
      const applicant = faker.helpers.arrayElement(citizens);
      const assignedOfficer = faker.helpers.arrayElement(officers);
      const category = faker.helpers.arrayElement(categories);
      const type = category === "VITAL" ? faker.helpers.arrayElement(types) : null;

      // Logic for Form Data Selection
      let finalFormData = {};
      if (category === "TIN") {
        finalFormData = generateTinFormData();
      } else if (type === "birth") {
        finalFormData = generateBirthFormData();
      } else {
        finalFormData = generateMarriageFormData();
      }

      const statusRoll = Math.random();
      const faydaUploaded = faker.datatype.boolean();
      const kebeleUploaded = faker.datatype.boolean();
      let status;

      if (faydaUploaded && kebeleUploaded && statusRoll < 0.6) status = "approved";
      else if ((!faydaUploaded || !kebeleUploaded) || (statusRoll < 0.7 && statusRoll > 0.6)) status = "rejected";
      else status = "pending";

      currentNow = new Date();
      currentCreated = faker.date.between({
        from: new Date(currentNow.getTime() - (365 * 24 * 60 * 60 * 1000)),
        to: new Date(currentNow.getTime() - (24 * 60 * 60 * 1000))
      });

      applications.push({
        applicant: applicant._id,
        category,
        type,
        status,
        assignedOfficer: assignedOfficer._id,
        formData: finalFormData,
        requiredIDs: { kebele: kebeleUploaded, fayda: faydaUploaded },
        rejectionReason: status === "rejected" ? faker.lorem.sentence() : null,
        createdAt: currentCreated,
        updatedAt: faker.date.between({ from: currentCreated, to: currentNow })
      });

      if (status === "pending") {
        const oId = assignedOfficer._id.toString();
        officerWorkloadMap[oId] = (officerWorkloadMap[oId] || 0) + 1;
      }
    }

    await Application.insertMany(applications);

    const updatePromises = Object.entries(officerWorkloadMap).map(([id, load]) =>
      Officer.findByIdAndUpdate(id, { $inc: { workLoad: load } })
    );
    await Promise.all(updatePromises);

    console.log(`${count} applications seeded successfully`);
  } catch (error) {
    console.error("CRASH DETECTED!", error);
    throw error;
  }
}