import User from "../../src/models/User.js";
import Officer from "../../src/models/Officer.js";
import Application from "../../src/models/Application.js";
import Conversation from "../../src/models/Conversation.js";
import SecurityLog from "../../src/models/SecurityLog.js";
import { connectDB } from "./index.js";
import { refreshAnalytics } from "../../src/services/officer_analytics/analytics.service.js";
import path from "path";
import { fileURLToPath } from "url";

export async function clear() {
  await connectDB();
  console.log("Cleaning transactional data...");

  try {
    await Application.deleteMany({});
    await Conversation.deleteMany({});
    await SecurityLog.deleteMany({});

    await User.deleteMany({ role: { $ne: "admin" } });

    console.log("Transactional data deleted. Refreshing analytics...");

    await refreshAnalytics();

    console.log("Database cleared and Analytics refreshed successfully.");
  } catch (error) {
    console.error("Error during database clear:", error);
    throw error;
  }
}

const nodePath = fileURLToPath(import.meta.url);
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(nodePath)
) {
  clear()
    .then(() => {
      console.log("Process complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

clear();
