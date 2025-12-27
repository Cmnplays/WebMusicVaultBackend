import app from "./app";
import connectDb from "./config/config";
import { env } from "./config/env";
// import directUploader from "./scripts/directUploadFromSystem";
// import { checkDbData, checkDuplicateFiles } from "./scripts/mongodbfiletest";
import directDownloader from "./scripts/directDownloadToSystem";
const startServer = async () => {
  try {
    await connectDb();
    app.listen(env.PORT);
    // checkDbData();
    // checkDuplicateFiles();
    //-->give path of folder in which your songs are present
    // directUploader("E:/Personal Folders/Music/musics/hindi");
    // directDownloader("E:/Personal Folders/Music/musics/hindi");
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error while starting the server: ", error.message, error);
    }
    process.exit(1);
  }
};

startServer();
