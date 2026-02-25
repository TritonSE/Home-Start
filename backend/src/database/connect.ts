import mongoose from "mongoose";

export async function connectToDatabase() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  await mongoose.connect(uri);
}
