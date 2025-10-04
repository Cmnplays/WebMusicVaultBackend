import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Song from "../models/song.model";
import { HttpStatus } from "../utils/HttpStatus";
const getAboutDetails = asyncHandler(async (req: Request, res: Response) => {
  const totalNumOfSongs = await Song.countDocuments();
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    totalNumOfSongs,
  });
});
export { getAboutDetails };
