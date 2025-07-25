"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const songRouter = (0, express_1.default)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const song_controller_1 = require("../controllers/song.controller");
songRouter.post("/upload", upload.array("songs", 3), song_controller_1.uploadSongs);
songRouter.get("/", song_controller_1.getAllSongs);
songRouter.get("/:id", song_controller_1.getSongById);
songRouter.delete("/:id", song_controller_1.deleteSongById);
exports.default = songRouter;
