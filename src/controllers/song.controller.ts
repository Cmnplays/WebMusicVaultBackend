import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Song from "../models/song.model";
import { HttpStatus } from "../utils/HttpStatus";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import {
  getSongsOrSearchSongsService,
  uploadSongService,
  deleteSongService,
} from "../services/song.services";
import {
  idParamSchema,
  getSongsSchema,
  searchSongsSchema,
} from "../schemas/song.schema";

const uploadSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];
    const data = await uploadSongService(files);
    let msg = "";
    if (data.uploaded.length === 0 && data.skipped.length > 0) {
      msg = "All songs were skipped or failed to upload.";
    } else if (data.uploaded.length > 0 && data.skipped.length > 0) {
      msg = `${data.uploaded.length} song(s) uploaded successfully. ${data.skipped.length} skipped.`;
    } else if (data.uploaded.length > 0) {
      msg = `${data.uploaded.length} song(s) uploaded successfully.`;
    } else {
      msg = "No files were uploaded.";
    }
    res
      .status(HttpStatus.Created)
      .json(new ApiResponse(HttpStatus.Created, msg, data));
  },
);

//to be updated
const getSongsOrSearchSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const isSearch = Object.keys(req.query).some((key) =>
      ["query", "tags", "genre", "artist", "title"].includes(key),
    );
    let data;
    if (isSearch) {
      data = searchSongsSchema.parse(req.query);
    } else {
      data = getSongsSchema.parse(req.query);
    }
    const { songs, nextCursor, hasMoreSongs } =
      await getSongsOrSearchSongsService({ ...data, isSearch });
    res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Songs sent successfully", {
        songs,
        nextCursor,
        hasMoreSongs,
      }),
    );
  },
);
const getSongById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const song = await Song.findById(id);
    if (!song) {
      throw new ApiError(HttpStatus.NotFound, "Song not found");
    }
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, "Song sent successfully", song));
  },
);
const deleteSongById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    await deleteSongService(id);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, `song deleted successfully`, null));
  },
);
const getRandomSong = asyncHandler(async (_req: Request, res: Response) => {
  const randomSongArray = await Song.aggregate([{ $sample: { size: 1 } }]);
  if (!randomSongArray.length) {
    res
      .status(HttpStatus.NotFound)
      .send(new ApiResponse(HttpStatus.NotFound, "No songs found", null));
  }
  res
    .status(HttpStatus.OK)
    .send(
      new ApiResponse(
        HttpStatus.OK,
        "Successfully sent a random song",
        randomSongArray[0],
      ),
    );
});
const updateSongById = asyncHandler(async (req: Request, res: Response) => {});
export {
  uploadSongs,
  getSongById,
  deleteSongById,
  getRandomSong,
  updateSongById,
  getSongsOrSearchSongs,
};
