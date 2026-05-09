import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);

    if (!process.env.MONGODB_URI) {
      console.log("MongoDB URI is not defined in environment variables");
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("✅ MongoDB Connected");
    console.log(`📦 Host: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);

    // Exit process if DB fails
    process.exit(1);
  }
};
