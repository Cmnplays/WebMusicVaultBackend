import { env } from "../config/env";
import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

// ===== CONFIG =====
const API_UPLOAD_ENDPOINT = "http://localhost:3000/api/v1/song/upload";

// Only run locally
if (process.env.BACKEND_ENV !== "home") {
  console.log("localSongUploader: Not running (not home environment)");
  process.exit(0);
}

if (!env.SONG_FOLDER_PATHS) {
  console.error("SONG_FOLDER_PATHS is not defined in env");
  process.exit(1);
}

console.log(`Watching folder: ${env.SONG_FOLDER_PATHS} for new songs...`);

// ===== UPLOAD FUNCTION =====
async function uploadFiles(filePaths: string[]) {
  const form = new FormData();
  filePaths.forEach((file) => form.append("songs", fs.createReadStream(file)));

  try {
    const res = await axios.post(API_UPLOAD_ENDPOINT, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (res.data.errors?.length > 0) {
      console.log("Duplicate or existing songs detected:");
      res.data.errors.forEach((err: string) => console.log(`- ${err}`));
    }

    console.log(
      `Uploaded: ${filePaths.map((f) => path.basename(f)).join(", ")} -> ${
        res.data.message || "success"
      }`
    );
  } catch (err: any) {
    console.error(
      `Failed to upload: ${filePaths
        .map((f) => path.basename(f))
        .join(", ")} -> ${err.response?.data?.message || err.message}`
    );
  }
}

// ===== WATCHER =====
const watcher = chokidar.watch(env.SONG_FOLDER_PATHS, { ignoreInitial: true });

watcher.on("add", async (filePath) => {
  if (filePath.endsWith(".mp3")) {
    console.log(`New song detected: ${path.basename(filePath)}`);
    await uploadFiles([filePath]); // send as array just like frontend
  }
});
