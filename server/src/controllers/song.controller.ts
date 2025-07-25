import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { uploadSong } from "../config/cloudinary";
import Song from "../models/song.model";
import { HttpStatus } from "../utils/HttpStatus";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";

const uploadSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res
        .status(HttpStatus.BadRequest)
        .json(new ApiError(HttpStatus.BadRequest, "No files uploaded"));
      return;
    }

    const savedSongs = [];
    for (const file of files) {
      const uploadResult = await uploadSong(file.buffer);
      const song = await Song.create({
        title: file.originalname,
        duration: file.size,
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
    return;
  }
);

const getAllSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const songs = await Song.find()
      .select("title duration")
      .skip(skip)
      .limit(limit);

    if (!songs || songs.length === 0) {
      res
        .status(HttpStatus.NotFound)
        .json(new ApiError(HttpStatus.NotFound, "No songs found"));
      return;
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
      res
        .status(HttpStatus.NotFound)
        .json(new ApiError(HttpStatus.NotFound, "Song not found"));
    }

    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, "Song sent successfully", song));
  }
);

export { uploadSongs, getAllSongs, getSongById };
