import mongoose from "mongoose";
import env from "./env"; // already done in step 1 of your setup

export const connectDB = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log("✅ MongoDB Atlas connected");

    const close = async () => {
      await mongoose.connection.close();     // DB connection safely close
      console.log("🛑 MongoDB connection closed");
      process.exit(0);                       // exit cleanly
    };

    process.on("SIGINT", close);  // signal: Ctrl+C
    
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    console.error(err);
    process.exit(1); // stop server if db not connected
  }
};
