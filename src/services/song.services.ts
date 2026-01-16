import ApiError from "../utils/ApiError";
import { HttpStatus } from "../utils/HttpStatus";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { deleteFile, uploadFile } from "../config/cloudinary";
import Song from "../models/song.model";
import type { Song as SongT } from "../models/song.model";
import { Types } from "mongoose";
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
type sortBy = "createdAt" | "title" | "playCount" | "duration";
type cursor = Types.ObjectId | string | number | Date;
interface getSongsOrSearchSongsServiceI {
  limit: number;
  sortBy: sortBy;
  sortOrder: "asc" | "desc";
  cursor?: cursor;
  query?: string;
  title?: string;
  artist?: string;
  genre?: string;
  tags?: string[];
  isSearch: Boolean;
}

const uploadSongService = async (
  files: Express.Multer.File[],
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
          uploadResult.error.message || "Upload failed",
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
          "There was a problem while uploading song",
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

const getSongsOrSearchSongsService = async ({
  sortBy,
  sortOrder,
  cursor,
  limit,
  query,
  // artist,
  genre,
  tags,
  isSearch,
}: getSongsOrSearchSongsServiceI): Promise<{
  songs: SongT[];
  nextCursor: cursor | undefined;
  hasMoreSongs: boolean;
}> => {
  let songs;
  let hasMoreSongs = false;
  let nextCursor;
  const getQuery = cursor
    ? sortOrder === "asc"
      ? { [sortBy]: { $gt: cursor } }
      : { [sortBy]: { $lt: cursor } }
    : {};
  const sort = { [sortBy]: sortOrder };
  if (!isSearch) {
    songs = await Song.find(getQuery)
      .sort(sort)
      .limit(limit + 1)
      .lean();
  } else {
    //*Plan for searching:
    // 1.query is required , if you want to search without query just the like tags and genre frontend will handle this with filter option like we get in the daraj app filter thing or even like how i have added sorting in the app
    // 2.after query is received the query is breaked into words, and each words will be searched in both the artist and title and the result of both will be combined and searched.
    // 3.note since tags and genres are fixed by the admin they will remain fixed in the filter section and both in the search section
    // 4.if user sends tags or genre then the query obj will contain tags and genre and they will be only searched in their corresponding field not like the query which is going to be searched on both the title field and the artist field
    //5.since i switched back to regex instead of text search remove the text index from there and use normal index.

    const dbSearchQuery: {} = {
      ...(query && {
        $and: query.split(" ").map((word) => {
          return {
            $or: [
              { title: { $regex: word, $options: "i" } },
              { artist: { $regex: word, $options: "i" } },
            ],
          };
        }),
      }),
      ...(tags && { tags: { $in: tags } }),
      ...(genre && { genre }),
      // artist: "",
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
    nextCursor = songs[songs.length - 1][sortBy || "_id"];
  }

  return { songs, nextCursor, hasMoreSongs };
};
export { uploadSongService, getSongsOrSearchSongsService, deleteSongService };
