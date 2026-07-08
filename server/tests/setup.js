import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const connectTestDB = async () => {
  // If you cannot download the in-memory binary, set USE_REAL_MONGO=1 and run a local Mongo (Docker or installed)
  if (process.env.USE_REAL_MONGO === "1") {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/testdb";
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
    process.env.ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "1h";
    process.env.REFRESH_TOKEN_EXPIRES =
      process.env.REFRESH_TOKEN_EXPIRES || "7d";
    await mongoose.connect(uri); // modern mongoose doesn't need useNewUrlParser/useUnifiedTopology
    return;
  }

  // Default: try mongodb-memory-server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
  process.env.ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "1h";
  process.env.REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

  await mongoose.connect(uri);
};

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    // dropDatabase removed to avoid hanging. mongoServer.stop() handles data wiping.
    await mongoose.disconnect();
  }
  if (mongoServer) await mongoServer.stop();
};
