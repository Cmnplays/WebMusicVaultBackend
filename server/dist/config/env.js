"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number(),
    MONGODB_URI: zod_1.z.url(),
    NODE_ENV: zod_1.z.enum(["development", "production"]),
    ACCESS_TOKEN_SECRET: zod_1.z.string().min(1, "Access token secret is required"),
    REFRESH_TOKEN_SECRET: zod_1.z.string().min(1, "Refresh token secret is required"),
    ACCESS_TOKEN_EXPIRY: zod_1.z
        .string()
        .regex(/^\d+[smhd]$/, "Must be a valid time string (e.g., '15m', '1h', '7d')"),
    REFRESH_TOKEN_EXPIRY: zod_1.z
        .string()
        .regex(/^\d+[smhd]$/, "Must be a valid time string (e.g., '15m', '1h', '7d')"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}
exports.env = parsedEnv.data;
