import { z } from "zod";
import { username } from "./user.schema";
import { GENRES, TAGS } from "../models/song.model";
const song = z.custom<Express.Multer.File>();
export const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const artist = z
  .string()
  .trim()
  .min(1, "artist must be at least 1 characters")
  .max(30, "artist must be less than or equal to 30 characters")
  .regex(/^[a-z0-9._ ]+$/, "artist can only contain lowercase letters")
  .transform((u) => u.toLowerCase());

const uploadSongSchema = z.object({
  files: z
    .array(song)
    .min(1, "At least 1 song is required")
    .max(3, "At most 3 songs are allowed"),
  artist: artist.optional(),
  owner: username,
  genre: z.enum(GENRES).optional(),
  tags: z.array(z.enum(TAGS)).optional(),
});

const getSongsSchema = z.object({
  limit: z.coerce.number().min(1).max(25).default(20),
  sortBy: z
    .enum(["createdAt", "title", "playCount", "duration"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  cursor: mongoId,
});
const searchSongsSchema = getSongsSchema.extend({
  query: z.string().trim().min(1).max(50).optional(),
  genre: z.enum(GENRES).optional(),
  tags: z.array(z.enum(TAGS)).optional(),
});

const idParamSchema = z.object({
  id: mongoId,
});

type idType = z.infer<typeof mongoId>;
export {
  uploadSongSchema,
  getSongsSchema,
  idParamSchema,
  idType,
  searchSongsSchema,
};
