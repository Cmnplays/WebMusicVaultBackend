"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesSchema = void 0;
const zod_1 = require("zod");
const songFileSchema = zod_1.z.object({
    originalname: zod_1.z.string(),
    mimetype: zod_1.z.string().regex(/^audio\//, "File must be an audio"),
    size: zod_1.z.number().max(10 * 1024 * 1024, "File must be less than 10MB"),
});
exports.filesSchema = zod_1.z
    .array(songFileSchema)
    .max(3, "You can upload up to 3 files")
    .min(1, "At least one file is required");
