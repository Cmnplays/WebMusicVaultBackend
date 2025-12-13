import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { env } from "../config/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload IMAGE
export const uploadConsoleImage = async (
  buffer: Buffer
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "console/photos",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      }
    );
    stream.end(buffer);
  });
};

// Upload AUDIO
export const uploadConsoleAudio = async (
  buffer: Buffer
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "console/audio",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      }
    );
    stream.end(buffer);
  });
};

// Upload VIDEO
export const uploadConsoleVideo = async (
  buffer: Buffer
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "console/video",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      }
    );
    stream.end(buffer);
  });
};

export default cloudinary;
