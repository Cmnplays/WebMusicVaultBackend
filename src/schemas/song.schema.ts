import { z } from "zod";

const songFileSchema = z.object({
  originalname: z.string(),
  mimetype: z.string().regex(/^audio\//, "File must be an audio"),
  size: z.number().max(10 * 1024 * 1024, "File must be less than 10MB"),
});

export const filesSchema = z
  .array(songFileSchema)
  .max(3, "You can upload up to 3 files")
  .min(1, "At least one file is required");
