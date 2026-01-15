import multer from "multer";
import ApiError from "../utils/ApiError";
import { HttpStatus } from "../utils/HttpStatus";
import { env } from "../config/env";
const storage = multer.memoryStorage();
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb): void => {
  if (file.mimetype !== "audio/mpeg") {
    return cb(
      new ApiError(HttpStatus.BadRequest, "Only Mp3 files are allowed")
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_MUSIC_FILE_SIZE,
  },
});
