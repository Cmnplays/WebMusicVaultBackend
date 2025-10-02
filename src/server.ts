import app from "./app";
import connectDb from "./config/config";
import { env } from "./config/env";
import directUploader from "./scripts/directUploadFromSystem";

const startServer = async () => {
  try {
    await connectDb();
    app.listen(env.PORT);
    // directUploader("E:/Personal Folders/Music/musics");-->give path of folder in which your songs are present
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error while starting the server: ", error.message, error);
    }
    process.exit(1);
  }
};

startServer();
