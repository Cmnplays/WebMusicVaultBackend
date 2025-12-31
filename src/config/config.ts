import mongoose from "mongoose";
import { env } from "../config/env";
const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDb;
