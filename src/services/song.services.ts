import ApiError from "../utils/ApiError";
import { HttpStatus } from "../utils/HttpStatus";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { deleteFile, uploadFile } from "../config/cloudinary";
import Song from "../models/song.model";
import type { Song as SongT } from "../models/song.model";
import { SortOrder, Types } from "mongoose";
import { env } from "../config/env";
import {
  idType,
  songType,
  updateSongRequest,
  uploadSongRequest,
} from "../schemas/song.schema";
import { MongoServerError } from "mongodb";
import { FilterQuery } from "mongoose";

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
type nonUniqueSortBy = "playCount" | "duration" | "createdAt";
type uniqueSortBy = "title";
type sortByT = nonUniqueSortBy | uniqueSortBy;
type cursorT =
  | {
      value: string | number | Date;
      _id?: string;
    }
  | undefined;

interface getSongsOrSearchSongsServiceI {
  limit: number;
  sortBy: sortByT;
  sortOrder: "asc" | "desc";
  cursor?: cursorT;
  query?: string;
  title?: string;
  genre?: string;
  tags?: string[];
  isSearch: boolean;
}
type uploadResultReturnT =
  | {
      type: "skipped";
      title: string;
      reason: string;
    }
  | {
      type: "uploaded";
      song: SongT;
    };
const uploadSongService = async (
  body: uploadSongRequest,
  files: songType,
): Promise<uploadSongResponse> => {
  const tasks = files.map(async (file): Promise<uploadResultReturnT> => {
    let uploadResult: UploadApiResponse | UploadApiErrorResponse | undefined;
    try {
      uploadResult = await uploadFile({
        buffer: file.buffer,
        folder: "songs",
        resource_type: "video",
      });
      if ("error" in uploadResult) {
        return {
          type: "skipped",
          title: file.originalname,
          reason: "Unexpected error while uploading",
        };
      }
      const song = await Song.create({
        title: body.title ? body.title : file.originalname,
        duration: uploadResult.duration,
        publicId: uploadResult.public_id,
        fileUrl: uploadResult.secure_url,
        playbackUrl: uploadResult.playback_url,
        ...(body.owner && { owner: body.owner }),
      });
      return { type: "uploaded", song };
    } catch (error) {
      env.NODE_ENV === "development" && console.error(error);
      if (uploadResult?.public_id) {
        await deleteFile({
          publicId: uploadResult.public_id,
          resource_type: "video",
        });
        if (error instanceof MongoServerError && error.code === 11000) {
          //11000 is code for duplicate document returned by mongoose itslef
          return {
            type: "skipped",
            title: file.originalname,
            reason: "Song is already uploaded.", //this is for race conditions when 2 users upload same song and this helps to reduce one database fetching for exisitng user check and this works when unique is true in the fieldname in the schema
          };
        }
        return {
          type: "skipped",
          title: file.originalname,
          reason: "Unexpected error while uploading",
        };
      }
      return {
        type: "skipped",
        title: file.originalname,
        reason: "Unexpected error while uploading",
      };
    }
  });

  const results = await Promise.allSettled(tasks);
  const uploadedSongs: SongT[] = [];
  const skippedSongs: skippedT = [];
  console.log(results);
  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value.type === "uploaded") {
        uploadedSongs.push(r.value.song);
      } else {
        skippedSongs.push({ title: r.value.title, reason: r.value.reason });
      }
    }
  }
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

//need to be fixed tommorow will do
//*for non unique fields need to use the _id as secondary cusror for exactly getting the documente
const getSongsOrSearchSongsService = async ({
  sortBy,
  sortOrder,
  cursor,
  limit,
  query,
  genre,
  tags,
  isSearch,
}: getSongsOrSearchSongsServiceI): Promise<{
  songs: SongT[];
  nextCursor: cursorT;
  hasMoreSongs: boolean;
}> => {
  let songs;
  let hasMoreSongs = false;
  let nextCursor: cursorT;
  const cursorQuery: FilterQuery<SongT> = cursor
    ? sortOrder === "asc"
      ? {
          $or: [
            {
              [sortBy]: { $gt: cursor.value },
            },
            {
              [sortBy]: cursor.value,
              _id: { $gt: new Types.ObjectId(cursor._id) },
            },
          ],
        }
      : {
          $or: [
            {
              [sortBy]: { $lt: cursor.value },
            },
            {
              [sortBy]: cursor.value,
              _id: { $lt: new Types.ObjectId(cursor._id) },
            },
          ],
        }
    : {};
  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
    _id: sortOrder === "asc" ? 1 : -1,
  };
  if (!isSearch) {
    songs = await Song.find(cursorQuery)
      .sort(sort)
      .limit(limit + 1)
      .lean();
  } else {
    const dbSearchQuery: FilterQuery<SongT> = {
      ...(query && {
        $and: [
          ...query.split(" ").map((word) => {
            return {
              $or: [
                { title: { $regex: word, $options: "i" } },
                { artist: { $regex: word, $options: "i" } },
              ],
            };
          }),
          cursorQuery,
        ],
      }),
      ...(tags && { tags: { $in: tags } }),
      ...(genre && { genre }),
    };

    songs = await Song.find(dbSearchQuery)
      .sort(sort)
      .limit(limit + 1)
      .lean();
  }
  if (songs.length > limit) {
    hasMoreSongs = true;
    songs.pop();
  }
  if (!hasMoreSongs || songs.length === 0) {
    nextCursor = undefined;
  } else {
    const lastSong = songs[songs.length - 1];
    nextCursor = {
      value: lastSong[sortBy],
      _id: lastSong._id.toString(),
    };
  }

  return { songs, nextCursor, hasMoreSongs };
};

// const updateSongFields = async ({
//   songId,
//   title,
//   artist,
//   tags,
//   genre,
// }: updateSongRequest): Promise<SongT> => {};
export {
  uploadSongService,
  getSongsOrSearchSongsService,
  deleteSongService,
  // updateSongFields,
};
