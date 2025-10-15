import app from "./app";
import connectDb from "./config/config";
import { env } from "./config/env";
// import directUploader from "./scripts/directUploadFromSystem";
// import { checkDbData, checkDuplicateFiles } from "./scripts/mongodbfiletest";
const startServer = async () => {
  try {
    await connectDb();
    app.listen(env.PORT);
    // checkDbData();
    // checkDuplicateFiles();
    // directUploader("E:/Personal Folders/Music/musics/hindi"); //-->give path of folder in which your songs are present
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error while starting the server: ", error.message, error);
    }
    process.exit(1);
  }
};

startServer();
