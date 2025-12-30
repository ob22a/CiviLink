import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const { MONGO_URI } = process.env; // This is for local testing. Make sure to set the MONGO_URI as local database and not the actual one. I didn't use TEST_DB_URI because I can't test with postman while using it.

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to TEST DB");
}