import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
cloudinary.config({
  cloud_name: "dqh9frccg",
  api_key: "754461921225799",
  api_secret: "JmdjNaZV2UpL8eDHXoGaAaiYkoM",
  secure: true,
});

export const uploadSong = async (
  buffer: Buffer
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "songs" },
      (error, result) => {
        if (error) {
          console.error("Upload failed:", error);
          return reject(error);
        }
        console.log("Upload successful:", result?.public_id);
        resolve(result!);
      }
    );

    stream.end(buffer);
  });
};

export const deleteSong = async (publicId: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "video",
      },
      (err, result) => {
        if (err) {
          reject(new Error(`Cloudinary Delete failed: ${err.message}`));
        } else {
          resolve(result);
        }
      }
    );
  });
};

export default cloudinary;
