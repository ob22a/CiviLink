// config/testDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectTestDB = async () => {
  // Skip if already connected — jestSetup.js manages the global connection
  if (mongoose.connection.readyState !== 0) {
    return;
  }
  try {
    const uri =
      process.env.MONGO_URI_TEST || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/testDB";

    await mongoose.connect(uri);
    console.log("Connected to test DB");
  } catch (err) {
    console.error("Failed to connect to test DB", err);
    process.exit(1);
  }
};

export default connectTestDB;
