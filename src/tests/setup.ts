import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { before, after, afterEach } from "node:test";
import dotenv from "dotenv";

dotenv.config();

let mongoServer: MongoMemoryServer;

// ======================================================
// Connect to in-memory database before all tests
// ======================================================

before(async () => {
  mongoServer = await MongoMemoryServer.create();

  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  console.log("✅ In-Memory MongoDB Connected");
});

// ======================================================
// Clean database after each test
// ======================================================

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];

    await collection.deleteMany({});
  }
});

// ======================================================
// Disconnect and stop server after tests
// ======================================================

after(async () => {
  await mongoose.connection.close();

  await mongoServer.stop();

  console.log("✅ In-Memory MongoDB Stopped");
});
