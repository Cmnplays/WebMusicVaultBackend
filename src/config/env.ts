import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  MONGODB_URI: z.url(),
  NODE_ENV: z.enum(["development", "production"]),
  ACCESS_TOKEN_SECRET: z.string().min(1, "Access token secret is required"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "Refresh token secret is required"),
  ACCESS_TOKEN_EXPIRY: z
    .string()
    .regex(
      /^\d+[smhd]$/,
      "Must be a valid time string (e.g., '15m', '1h', '7d')"
    ),
  REFRESH_TOKEN_EXPIRY: z
    .string()
    .regex(
      /^\d+[smhd]$/,
      "Must be a valid time string (e.g., '15m', '1h', '7d')"
    ),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "Cloud name is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "Cloudinary API key is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "Cloudinary API secret is required"),
  FRONTEND_URL: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
