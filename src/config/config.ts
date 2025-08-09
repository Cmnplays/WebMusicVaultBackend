import mongoose from "mongoose";
import { env } from "../config/env";
const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    throw error;
  }
};

export default connectDb;
