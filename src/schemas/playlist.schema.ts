import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(3, "Playlist name must be greater than 2 characters")
  .max(15, "Playlist name must be less than 15 characters")
  .regex(
    /^[a-zA-Z0-9_ ]+$/,
    "Playlist name can only contain letters, numbers, underscores, and spaces"
  );

const description = z
  .string()
  .trim()
  .min(3, "Description must be greater than 2 letters")
  .max(50, "Description must be less than 50 letters")
  .optional();

const status = z.enum(["private", "public"]).default("private");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const createPlaylistSchema = z.object({
  body: z.object({
    name,
    description,
    status,
  }),
});

const modifyPlaylistSongSchema = z.object({
  params: z.object({
    playlistId: objectId,
    songId: objectId,
  }),
});

export { createPlaylistSchema, modifyPlaylistSongSchema, objectId };
