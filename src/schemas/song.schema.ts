import { z } from "zod";
import { username } from "./user.schema";
import { GENRES, TAGS } from "../models/song.model";

export const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const artist = z
  .string()
  .trim()
  .min(1, "artist must be at least 1 characters")
  .max(30, "artist must be less than or equal to 30 characters")
  .regex(/^[a-zA-Z0-9._ ]+$/, "artist can only contain lowercase letters")
  .transform((u) => u.toLowerCase());

const uploadSongSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    artist: artist.optional(),
    owner: username,
    genre: z.enum(GENRES).optional(),
    tags: z.array(z.enum(TAGS)).optional(),
  }),
});

const baseGetSongsSchema = z.object({
  limit: z.coerce.number().min(1).max(25).default(20),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
const checkSortParams = (input: unknown) => {
  if (!input || typeof input !== "object") {
    return {
      sortBy: "createdAt",
      cursor: undefined,
    };
  }
  const obj = input as Record<string, unknown>;
  type sortByT = "createdAt" | "title" | "duration" | "playCount";
  const sortBy: sortByT =
    typeof obj.sortBy === "string" ? (obj.sortBy as any) : "createdAt";

  let cursor = obj.cursor;
  if (cursor === "" || cursor === null || cursor === "undefined") {
    cursor = undefined;
  }
  //for unique field
  if (sortBy === "title") {
    if (typeof cursor === "string") {
      const trimmed = cursor.trim();
      cursor = trimmed ? trimmed : undefined;
    } else {
      cursor = undefined;
    }
  }
  //for non-unique field
  if (
    sortBy === "createdAt" ||
    sortBy === "duration" ||
    sortBy === "playCount"
  ) {
    if (typeof cursor === "string") {
      try {
        const parsed = JSON.parse(cursor);
        if (parsed && typeof parsed === "object" && "value" in parsed) {
          cursor = parsed;
        } else {
          cursor = undefined;
        }
      } catch {
        cursor = undefined;
      }
    }
  }
  console.log({
    ...obj,
    sortBy,
    cursor,
  });
  return {
    ...obj,
    sortBy,
    cursor,
  };
};
//unique field
const titleExtend = {
  sortBy: z.literal("title"),
  cursor: z
    .object({
      value: z.coerce.date(),
    })
    .optional(),
};
//Non unique fields
const createdAtExtend = {
  sortBy: z.literal("createdAt"),
  cursor: z
    .object({
      value: z.coerce.date(),
      _id: mongoId,
    })
    .optional(),
};
const durationExtend = {
  sortBy: z.literal("duration"),
  cursor: z
    .object({
      value: z.coerce.number(),
      _id: mongoId,
    })
    .optional(),
};
const playCountExtend = {
  sortBy: z.literal("playCount"),
  cursor: z
    .object({
      value: z.coerce.number(),
      _id: mongoId,
    })
    .optional(),
};

const getSongsSchema = z.preprocess(
  (input) => {
    return checkSortParams(input);
  },
  z.discriminatedUnion("sortBy", [
    baseGetSongsSchema.extend(createdAtExtend),
    baseGetSongsSchema.extend(titleExtend),
    baseGetSongsSchema.extend(durationExtend),
    baseGetSongsSchema.extend(playCountExtend),
  ]),
);

const baseSearchSongsSchema = baseGetSongsSchema.extend({
  query: z.string().trim().min(1).max(50).optional(),
  genre: z.enum(GENRES).optional(),
  tags: z.array(z.enum(TAGS)).optional(),
});

const searchSongsSchema = z.preprocess(
  (input) => {
    console.log(input);
    return checkSortParams(input);
  },
  z.discriminatedUnion("sortBy", [
    baseSearchSongsSchema.extend(createdAtExtend),
    baseSearchSongsSchema.extend(titleExtend),
    baseSearchSongsSchema.extend(durationExtend),
    baseSearchSongsSchema.extend(playCountExtend),
  ]),
);
const idParamSchema = z.object({
  id: mongoId,
});
const songSchema = z
  .array(z.custom<Express.Multer.File>())
  .min(1, "At least 1 song is required")
  .max(3, "At most 3 songs are allowed");

const editableSongFields = z.object({
  title: z.string().trim().min(1).max(100),
  artist: artist.optional(),
  genre: z.enum(GENRES).optional(),
  tags: z.array(z.enum(TAGS)).optional(),
});

const updateSchema = z.object({ songId: mongoId }).extend(
  editableSongFields.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be updated",
  }),
);
type updateSongRequest = z.infer<typeof updateSchema>;
type uploadSongRequest = z.infer<typeof uploadSongSchema>["body"];
type songType = z.infer<typeof songSchema>;
type idType = z.infer<typeof mongoId>;
export {
  uploadSongSchema,
  getSongsSchema,
  idParamSchema,
  idType,
  searchSongsSchema,
  uploadSongRequest,
  songSchema,
  songType,
  updateSchema,
  updateSongRequest,
};
