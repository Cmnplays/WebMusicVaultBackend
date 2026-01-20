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
  updateSongFields,
} from "../services/song.services";
import {
  idParamSchema,
  getSongsSchema,
  searchSongsSchema,
  uploadSongRequest,
  songSchema,
  updateSchema,
} from "../schemas/song.schema";

const uploadSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body: uploadSongRequest = req.body;
    const files = songSchema.parse(req.files);

    const uploadRes = await uploadSongService(body, files);
    let msg = "";
    if (uploadRes.uploaded.length === 0 && uploadRes.skipped.length > 0) {
      msg = "All songs were skipped or failed to upload.";
    } else if (uploadRes.uploaded.length > 0 && uploadRes.skipped.length > 0) {
      msg = `${uploadRes.uploaded.length} song(s) uploaded successfully. ${uploadRes.skipped.length} skipped.`;
    } else if (uploadRes.uploaded.length > 0) {
      msg = `${uploadRes.uploaded.length} song(s) uploaded successfully.`;
    } else {
      msg = "No files were uploaded.";
    }
    res
      .status(HttpStatus.Created)
      .json(new ApiResponse(HttpStatus.Created, msg, uploadRes));
  },
);

const getSongsOrSearchSongs = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const isSearch = Object.keys(req.query).some((key) =>
      ["query", "tags", "genre", "artist", "title"].includes(key),
    );
    let parsedQuery;
    if (isSearch) {
      parsedQuery = searchSongsSchema.parse(req.query);
    } else {
      parsedQuery = getSongsSchema.parse(req.query);
    }
    const { songs, nextCursor, hasMoreSongs } =
      await getSongsOrSearchSongsService({ ...parsedQuery, isSearch });
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
//this must be furthur extend to give random songs as per the given genre, tag , author or artist
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

const updateAllFieldsOfSong = asyncHandler(
  async (req: Request, res: Response) => {
    const data = updateSchema.parse(req.body);
    const updatedSong = await updateSongFields(data);

    res
      .status(HttpStatus.OK)
      .send(
        new ApiResponse(
          HttpStatus.OK,
          "Successfully sent a random song",
          updatedSong,
        ),
      );
  },
);

const getAllSongOfArtist = asyncHandler(
  async (req: Request, res: Response) => {},
);
export {
  uploadSongs,
  getSongById,
  deleteSongById,
  getRandomSong,
  updateAllFieldsOfSong,
  getSongsOrSearchSongs,
  getAllSongOfArtist,
};
