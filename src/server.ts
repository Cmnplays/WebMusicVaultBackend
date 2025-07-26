import app from "./app";
import connectDb from "./config/config";
import { env } from "./config/env";

const startServer = async () => {
  try {
    await connectDb();
    app.listen(env.PORT, () => {
      console.log("Server started successfully");
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error while starting the server: ", error.message, error);
    }
    process.exit(1);
  }
};

startServer();
