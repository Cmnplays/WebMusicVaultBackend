import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Song from "../models/song.model";
import { HttpStatus } from "../utils/HttpStatus";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import {
  getSongsService,
  uploadSongService,
  searchSongService,
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
    const { message, savedSongs, alreadyExistingSongs } =
      await uploadSongService(files);
    res
      .status(HttpStatus.Created)
      .json(
        new ApiResponse(
          HttpStatus.Created,
          message,
          savedSongs,
          alreadyExistingSongs
        )
      );
  }
);

const getSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = getSongsSchema.parse(req.query);
    const { songs, nextCursor, hasMoreSongs } = await getSongsService(data);

    res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Songs sent successfully", {
        songs,
        nextCursor,
        hasMoreSongs,
      })
    );
  }
);

const getSongById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const song = await Song.findById(id);
    //user query
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
    const { id } = idParamSchema.parse(req.params);
    await deleteSongService(id);
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, `song deleted successfully`, null));
  }
);

const searchSong = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = searchSongsSchema.parse(req.query);
    const { searchedSongs, nextCursor, hasMoreSongs } = await searchSongService(
      data
    );
    res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, "Songs sent successfully", {
        songs: searchedSongs,
        nextCursor,
        hasMoreSongs,
      })
    );
  }
);
const getRandomSong = asyncHandler(async (_req: Request, res: Response) => {
  const randomSongArray = await Song.aggregate([{ $sample: { size: 1 } }]);
  res
    .status(HttpStatus.OK)
    .send(
      new ApiResponse(
        HttpStatus.OK,
        "Successfully sent a random song",
        randomSongArray[0]
      )
    );
});
const updateSongById = asyncHandler(async (req: Request, res: Response) => {});
export {
  uploadSongs,
  getSongs,
  getSongById,
  deleteSongById,
  searchSong,
  getRandomSong,
  updateSongById,
};
