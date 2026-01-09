import News from "../../src/models/News.js";
import Officer from "../../src/models/Officer.js";
import User from "../../src/models/User.js";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

/**
 * Seed News documents for tests. Ensures at least one officer exists to act as author.
 * @param {number} count
 */
export async function seedNews(count = 5) {
  // Ensure there is at least one officer to be the author
  let officer = await Officer.findOne();
  if (!officer) {
    // Create a base user and convert to Officer via discriminator
    const citizen = await User.create({
      fullName: "Seed Officer",
      email: `seed-officer-${Date.now()}@example.com`,
      password: await bcrypt.hash("password123", 10),
      role: "citizen",
    });

    // Delete base user and re-create as Officer to ensure discriminator
    await User.deleteOne({ _id: citizen._id });

    officer = await Officer.create({
      ...citizen.toObject(),
      role: "officer",
      department: "approver",
      writeNews: true,
      subcity: "SeedCity",
    });
  }

  const newsDocs = [];
  for (let i = 0; i < count; i++) {
    newsDocs.push({
      title: faker.lorem.sentence(5),
      content: faker.lorem.paragraphs(2),
      author: officer._id,
      headerImageUrl: faker.datatype.boolean({ probability: 0.8 })?`${Date.now()}-${faker.system.commonFileName('png')}`:null,
    });
  }

  const created = await News.insertMany(newsDocs);
  return created;
}

export default seedNews;
