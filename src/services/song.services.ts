import ApiError from "../utils/ApiError";
import { HttpStatus } from "../utils/HttpStatus";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { deleteFile, uploadFile } from "../config/cloudinary";
import Song from "../models/song.model";
import type { Song as SongT } from "../models/song.model";
import mongoose, { Types, SortOrder } from "mongoose";
import ApiResponse from "../utils/ApiResponse";
import {
  getSongsRequest,
  idType,
  searchSongsRequest,
} from "../schemas/song.schema";
import { file } from "zod";

type skippedT = { title: string; reason: string }[];
interface uploadSongResponse {
  uploaded: SongT[];
  skipped: skippedT;
  summary: {
    totalFiles: number;
    uploadCount: number;
    skippedCount: number;
  };
}

const uploadSongService = async (
  files: Express.Multer.File[]
): Promise<uploadSongResponse> => {
  const uploadedSongs: SongT[] = [];
  const skippedSongs: skippedT = [];
  const tasks = files.map(async (file) => {
    let uploadResult: UploadApiResponse | UploadApiErrorResponse | undefined;
    try {
      const existingSong = await Song.findOne({ title: file.originalname });
      if (existingSong) {
        skippedSongs.push({
          title: existingSong.title,
          reason: `Song is already uploaded by user ${existingSong.owner}`,
        });
        return;
      }
      uploadResult = await uploadFile({
        buffer: file.buffer,
        folder: "songs",
        resource_type: "video",
      });
      if ("error" in uploadResult) {
        // Optional: rollback (though probably nothing uploaded yet)
        throw new ApiError(
          HttpStatus.InternalServerError,
          uploadResult.error.message || "Upload failed"
        );
      }
      const song = await Song.create({
        title: file.originalname,
        duration: durationInSeconds,
        publicId: uploadResult.public_id,
        fileUrl: uploadResult.secure_url,
      });
      uploadedSongs.push(song);
    } catch (error) {
      if (uploadResult?.public_id) {
        await deleteFile({
          publicId: uploadResult.public_id,
          resource_type: "video",
        });
      }
    }
  });
  return {
    uploaded: uploadedSongs,
    skipped: skippedSongs,
    summary: {
      totalFiles: files.length,
      uploadCount: uploadedSongs.length,
      skippedCount: skippedSongs.length,
    },
  };
};
const getSongsService = async ({
  sortByValue,
  cursor,
  limit,
}: getSongsRequest): Promise<{
  songs: SongT[];
  nextCursor: Types.ObjectId | undefined;
  hasMoreSongs: boolean;
}> => {
  let sortBy: SortOrder;
  if (!sortByValue) {
    sortBy = -1; // descending
  } else if (sortByValue.toLowerCase() === "asc") {
    sortBy = -1; //descending
  } else {
    sortBy = 1; //ascending
  }
  const query: any = {};
  if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
    cursor = undefined;
  }
  if (cursor) {
    query._id = sortBy === 1 ? { $gt: cursor } : { $lt: cursor };
  }

  const songs = await Song.find(query)
    .select("title duration fileUrl")
    .limit(limit + 1)
    .sort({ createdAt: sortBy });
  const hasMoreSongs = songs.length > limit;
  if (hasMoreSongs) {
    songs.pop();
  }
  const nextCursor = songs.length ? songs[songs.length - 1]._id : undefined;

  if (!songs || songs.length === 0) {
    throw new ApiResponse(HttpStatus.NotFound, "No songs found", null);
  }
  return { songs, nextCursor, hasMoreSongs };
};
const deleteSongService = async (id: idType): Promise<void> => {
  const song = await Song.findByIdAndDelete(id);
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
};
const searchSongService = async ({
  cursor,
  searchQuery,
  limit,
}: searchSongsRequest): Promise<{
  searchedSongs: SongT[];
  nextCursor: Types.ObjectId | undefined;
  hasMoreSongs: boolean;
}> => {
  let query: any = {};
  if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
    cursor = undefined;
  }
  if (cursor) {
    query = { $gt: cursor };
  }
  const searchedSongs = await Song.find({
    title: { $regex: searchQuery, $options: "i" },
    ...(cursor && { _id: query }),
  }).limit(limit + 1);
  const hasMoreSongs = searchedSongs.length > limit;
  if (hasMoreSongs) {
    searchedSongs.pop();
  }
  const nextCursor = searchedSongs.length
    ? searchedSongs[searchedSongs.length - 1]._id
    : undefined;
  return { searchedSongs, nextCursor, hasMoreSongs };
};

export {
  uploadSongService,
  getSongsService,
  deleteSongService,
  searchSongService,
};
