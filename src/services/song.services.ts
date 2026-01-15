import ApiError from "../utils/ApiError";
import { HttpStatus } from "../utils/HttpStatus";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { deleteFile, uploadFile } from "../config/cloudinary";
import Song from "../models/song.model";
import type { Song as SongT } from "../models/song.model";
import mongoose, { Types, SortOrder } from "mongoose";
import ApiResponse from "../utils/ApiResponse";
import { idType } from "../schemas/song.schema";

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
interface getSongsOrSearchSongsServiceI {
  limit: number;
  sortByValue: string;
  cursor?: string | undefined;
  q?: string;
  title?: string;
  artist?: string;
  genre?: string;
  tags?: string[];
  isSearch: Boolean;
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
        duration: uploadResult.duration,
        publicId: uploadResult.public_id,
        fileUrl: uploadResult.secure_url,
        playbackUrl: uploadResult.playback_url,
      });

      uploadedSongs.push(song);
    } catch (error) {
      if (uploadResult?.public_id) {
        await deleteFile({
          publicId: uploadResult.public_id,
          resource_type: "video",
        });
        throw new ApiError(
          HttpStatus.InternalServerError,
          "There was a problem while uploading song"
        );
      }
    }
  });

  await Promise.allSettled(tasks);
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
const deleteSongService = async (id: idType): Promise<void> => {
  const song = await Song.findByIdAndDelete(id);
  if (!song) {
    throw new ApiError(HttpStatus.NotFound, "Song not found");
  }
  await deleteFile({ publicId: song.publicId, resource_type: "video" });
};
const searchSongService = async ({
  cursor,
  searchQuery,
  limit,
}): Promise<{
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
const getSongsOrSearchSongsService = async ({
  sortByValue,
  cursor = undefined,
  limit,
  q,
  title,
  artist,
  genre,
  tags,
  isSearch,
}: getSongsOrSearchSongsServiceI): Promise<{
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
export {
  uploadSongService,
  getSongsOrSearchSongsService,
  deleteSongService,
  searchSongService,
};
