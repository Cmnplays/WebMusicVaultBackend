import { Response } from "express";
import ConsoleEntry from "./console.model";
import {
  uploadConsoleImage,
  uploadConsoleAudio,
  uploadConsoleVideo,
} from "./console.cloudinary";
import { ConsoleUploadRequest } from "./console.types";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { SortOrder } from "mongoose";

// ------------------------------------------------------
// Multer file typing
// ------------------------------------------------------
interface ConsoleFiles {
  photos?: Express.Multer.File[];
  audio?: Express.Multer.File[];
  video?: Express.Multer.File[];
}

// ------------------------------------------------------
// POST /console
// Upload text/photo/audio/video
// ------------------------------------------------------
export const uploadConsoleController = async (
  req: ConsoleUploadRequest,
  res: Response
) => {
  try {
    const { mode, timestamp, text } = req.body;

    if (!mode || !timestamp) {
      return res
        .status(400)
        .json(new ApiError(400, "mode and timestamp are required"));
    }

    const entryData: Record<string, any> = {
      mode,
      timestamp: new Date(timestamp),
    };

    const files = req.files as ConsoleFiles;

    // -------------------------
    // TEXT MODE
    // -------------------------
    if (mode === "text") {
      if (!text) {
        return res
          .status(400)
          .json(new ApiError(400, "Text content is required"));
      }
      entryData.text = text;
    }

    // -------------------------
    // PHOTO MODE
    // -------------------------
    if (mode === "photo") {
      const photos = files.photos;

      if (!photos || photos.length === 0) {
        return res
          .status(400)
          .json(new ApiError(400, "At least one photo is required"));
      }

      const uploadedPhotos = [];

      for (const file of photos) {
        const result = await uploadConsoleImage(file.buffer);

        uploadedPhotos.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        });
      }

      entryData.photos = uploadedPhotos;
    }

    // -------------------------
    // AUDIO MODE
    // -------------------------
    if (mode === "audio") {
      const audio = files.audio?.[0];

      if (!audio) {
        return res
          .status(400)
          .json(new ApiError(400, "Audio file is required"));
      }

      const result = await uploadConsoleAudio(audio.buffer);

      entryData.audio = {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: audio.originalname,
        mimeType: audio.mimetype,
        size: audio.size,
      };
    }

    // -------------------------
    // VIDEO MODE
    // -------------------------
    if (mode === "video") {
      const video = files.video?.[0];

      if (!video) {
        return res
          .status(400)
          .json(new ApiError(400, "Video file is required"));
      }

      const result = await uploadConsoleVideo(video.buffer);

      entryData.video = {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: video.originalname,
        mimeType: video.mimetype,
        size: video.size,
      };
    }

    // -------------------------
    // SAVE TO DATABASE
    // -------------------------
    const savedEntry = await ConsoleEntry.create(entryData);

    return res
      .status(201)
      .json(new ApiResponse(201, "Console entry created", savedEntry));
  } catch (error) {
    console.error("Console upload error:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to upload console entry"));
  }
};

// ------------------------------------------------------
// GET /console
// Cursor-based pagination
// ------------------------------------------------------
export const getConsoleEntries = async (
  req: ConsoleUploadRequest,
  res: Response
) => {
  try {
    const {
      cursor = null,
      limit = "20",
      sort = "newest",
      type = "all",
    } = req.query;

    const parsedLimit = Number(limit);

    // -------------------------
    // FILTER
    // -------------------------
    const filter: Record<string, any> = {};
    if (type !== "all") filter.mode = type;

    if (cursor) {
      filter._id = { $lt: cursor };
    }

    // -------------------------
    // SORT
    // -------------------------
    const sortOption: Record<string, SortOrder> = {
      createdAt: sort === "oldest" ? 1 : -1,
    };

    // -------------------------
    // QUERY
    // -------------------------
    const entries = await ConsoleEntry.find(filter)
      .sort(sortOption)
      .limit(parsedLimit + 1);

    const hasMore = entries.length > parsedLimit;
    const sliced = hasMore ? entries.slice(0, -1) : entries;
    const nextCursor = hasMore ? sliced[sliced.length - 1]._id : null;

    return res.status(200).json(
      new ApiResponse(200, "Console entries fetched", {
        entries: sliced,
        nextCursor,
        hasMore,
      })
    );
  } catch (error) {
    console.error("Fetch console entries error:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to fetch console entries"));
  }
};
