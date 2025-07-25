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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSongById = exports.getSongById = exports.getAllSongs = exports.uploadSongs = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cloudinary_1 = require("../config/cloudinary");
const song_model_1 = __importDefault(require("../models/song.model"));
const HttpStatus_1 = require("../utils/HttpStatus");
const ApiResponse_1 = __importDefault(require("../utils/ApiResponse"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const uploadSongs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    if (!files || files.length === 0) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.BadRequest, "No files uploaded. Please upload at least one song.");
    }
    const savedSongs = [];
    for (const file of files) {
        const uploadResult = yield (0, cloudinary_1.uploadSong)(file.buffer);
        const durationInSeconds = uploadResult.duration || 0;
        const song = yield song_model_1.default.create({
            title: file.originalname,
            duration: durationInSeconds,
            publicId: uploadResult.public_id,
            fileUrl: uploadResult.secure_url,
        });
        savedSongs.push(song);
    }
    res
        .status(HttpStatus_1.HttpStatus.Created)
        .json(new ApiResponse_1.default(HttpStatus_1.HttpStatus.Created, "Songs uploaded successfully", savedSongs));
}));
exports.uploadSongs = uploadSongs;
const getAllSongs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const songs = yield song_model_1.default.find()
        .select("title duration")
        .skip(skip)
        .limit(limit);
    if (!songs || songs.length === 0) {
        throw new ApiResponse_1.default(HttpStatus_1.HttpStatus.NotFound, "No songs found", null);
    }
    res
        .status(HttpStatus_1.HttpStatus.OK)
        .json(new ApiResponse_1.default(HttpStatus_1.HttpStatus.OK, "Songs sent successfully", songs));
}));
exports.getAllSongs = getAllSongs;
const getSongById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const song = yield song_model_1.default.findById(req.params.id);
    if (!song) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.NotFound, "Song not found");
    }
    res
        .status(HttpStatus_1.HttpStatus.OK)
        .json(new ApiResponse_1.default(HttpStatus_1.HttpStatus.OK, "Song sent successfully", song));
}));
exports.getSongById = getSongById;
const deleteSongById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const song = yield song_model_1.default.findByIdAndDelete(req.params.id);
    if (!song) {
        throw new ApiError_1.default(HttpStatus_1.HttpStatus.NotFound, "Song not found");
    }
    yield (0, cloudinary_1.deleteSong)(song.publicId);
    if (!song) {
        res
            .status(HttpStatus_1.HttpStatus.NotFound)
            .json(new ApiError_1.default(HttpStatus_1.HttpStatus.NotFound, "Song not found"));
        return;
    }
    res
        .status(HttpStatus_1.HttpStatus.OK)
        .json(new ApiResponse_1.default(HttpStatus_1.HttpStatus.OK, `song deleted successfully`, null));
}));
exports.deleteSongById = deleteSongById;
