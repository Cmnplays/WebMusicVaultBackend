"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSong = exports.uploadSong = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
cloudinary_1.v2.config({
    cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.env.CLOUDINARY_API_KEY,
    api_secret: env_1.env.CLOUDINARY_API_SECRET,
    secure: true,
});
const uploadSong = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ resource_type: "video", folder: "songs" }, (error, result) => {
            if (error) {
                console.error("Upload failed:", error);
                return reject(error);
            }
            console.log("Upload successful:", result === null || result === void 0 ? void 0 : result.public_id);
            resolve(result);
        });
        stream.end(buffer);
    });
});
exports.uploadSong = uploadSong;
const deleteSong = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: "video",
        }, (err, result) => {
            if (err) {
                reject(new Error(`Cloudinary Delete failed: ${err.message}`));
            }
            else {
                resolve(result);
            }
        });
    });
});
exports.deleteSong = deleteSong;
exports.default = cloudinary_1.v2;
