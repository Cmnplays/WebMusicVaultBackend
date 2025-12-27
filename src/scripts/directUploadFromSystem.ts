import { uploadSong } from "../config/cloudinary";
import Song from "../models/song.model";
import { UploadApiResponse } from "cloudinary";
import { readdir, readFile, stat } from "fs/promises";
import * as path from "path";

const directUploader = async (songFolderPath: string) => {
  try {
    const folderPath = path.isAbsolute(songFolderPath)
      ? songFolderPath
      : path.resolve(songFolderPath);
    const files = await readdir(folderPath);

    if (!files || files.length === 0) {
      console.log("No files in this directory");
      return;
    }

    const savedSongs: any = [];
    const alreadyExistingSongs: any = [];
    console.log("Number of files is ", files.length);
    for (const fileName of files) {
      const fullPath = path.join(folderPath, fileName);
      const fileStat = await stat(fullPath);

      if (!fileStat.isFile()) {
        console.log(fullPath, "in Not a file.\n");
        continue;
      }
      if (path.extname(fullPath).toLowerCase() !== ".mp3") {
        console.log(fullPath, "in not a mp3 file.\n");
        continue;
      }
      const buffer = await readFile(fullPath);
      const file = {
        originalname: fileName,
        buffer,
      };
      console.log("Uploading song -", fileName);
      const existingSong = await Song.findOne({ title: file.originalname });
      if (existingSong) {
        alreadyExistingSongs.push(existingSong.title);
        console.log("Already existing song", existingSong.title);
        continue;
      }
      const uploadResult: UploadApiResponse = await uploadSong(file.buffer);

      const durationInSeconds = uploadResult.duration || 0;

      const song = await Song.create({
        title: file.originalname,
        duration: durationInSeconds,
        publicId: uploadResult.public_id,
        fileUrl: uploadResult.secure_url,
      });
      savedSongs.push(song.title);
      console.log("Uploaded", song.title, "successfully.");
    }
    console.log({ savedSongs });
    console.log({ alreadyExistingSongs });
  } catch (error) {
    console.log("Error::", error);
  }
};

export default directUploader;
