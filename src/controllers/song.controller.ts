import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { uploadSong, deleteSong } from "../config/cloudinary";
import Song from "../models/song.model";
import { HttpStatus } from "../utils/HttpStatus";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { UploadApiResponse } from "cloudinary";
import type { SortOrder } from "mongoose";

const uploadSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new ApiError(
        HttpStatus.BadRequest,
        "No files uploaded. Please upload at least one song."
      );
    }

    const savedSongs = [];
    for (const file of files) {
      const existingSong = await Song.findOne({ title: file.originalname });
      if (existingSong) {
        throw new ApiError(
          HttpStatus.Conflict,
          `Song with title "${file.originalname}" already exists.`
        );
      }
      const uploadResult: UploadApiResponse = await uploadSong(file.buffer);

      const durationInSeconds = uploadResult.duration || 0;

      const song = await Song.create({
        title: file.originalname,
        duration: durationInSeconds,
        publicId: uploadResult.public_id,
        fileUrl: uploadResult.secure_url,
      });
      savedSongs.push(song);
    }

    res
      .status(HttpStatus.Created)
      .json(
        new ApiResponse(
          HttpStatus.Created,
          "Songs uploaded successfully",
          savedSongs
        )
      );
  }
);

const getAllSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortByValue = req.query.SortOrder as string | undefined;
    let sortBy: SortOrder;
    if (!sortByValue) {
      sortBy = -1; // descending
    } else {
      if (sortByValue === "asc") {
        sortBy = 1; // ascending
      } else {
        sortBy = -1; // descending
      }
    }

    const songs = await Song.find()
      .select("title duration fileUrl")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: sortBy });

    if (!songs || songs.length === 0) {
      throw new ApiResponse(HttpStatus.NotFound, "No songs found", null);
    }

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, "Songs sent successfully", songs));
  }
);

const getSongById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const song = await Song.findById(req.params.id);
    if (!song) {
      throw new ApiError(HttpStatus.NotFound, "Song not found");
    }
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, "Song sent successfully", song));
  }
);

const deleteSongById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      throw new ApiError(HttpStatus.NotFound, "Song not found");
    }

    await deleteSong(song!.publicId);
    if (!song) {
      res
        .status(HttpStatus.NotFound)
        .json(new ApiError(HttpStatus.NotFound, "Song not found"));
      return;
    }
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, `song deleted successfully`, null));
  }
);

export { uploadSongs, getAllSongs, getSongById, deleteSongById };
