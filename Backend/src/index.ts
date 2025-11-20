import app from "./app";
import env from "./config/env"; // ts-node can resolve .ts; build will emit .js
import { connectDB } from "./config/db";

const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
};

startServer();