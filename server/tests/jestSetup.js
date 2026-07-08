import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    process.env.TEST_DB_URI = mongoServer.getUri();
    process.env.MONGO_URI_TEST = mongoServer.getUri();
    process.env.MONGO_URI = mongoServer.getUri();
    process.env.JWT_SECRET = "testsecret";
    process.env.ACCESS_TOKEN_EXPIRES = "1h";
    process.env.REFRESH_TOKEN_EXPIRES = "7d";

    await mongoose.connect(mongoServer.getUri());
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
