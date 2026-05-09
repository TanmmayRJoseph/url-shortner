import http from "http";
import app from "./app";
import dotenv from "dotenv";
import { connectRedis } from "./configs/redis";
import { connectToDB } from "./configs/connectDb";

dotenv.config();

const startServer = async () => {
  try {
    // Database connection
    await connectToDB();

    // Redis connection
    await connectRedis();

    // Server 
    const server = http.createServer(app);

    const PORT = process.env.PORT || 3000;

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();