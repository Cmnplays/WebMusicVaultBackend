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
const song_schema_1 = require("../schemas/song.schema");
const song_controller_1 = require("../controllers/song.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
songRouter.post("/songs/upload", upload.array("songs", 3), (0, validate_middleware_1.validate)(song_schema_1.filesSchema), song_controller_1.uploadSongs);
songRouter.get("/songs", song_controller_1.getAllSongs);
songRouter.get("/songs/:id", song_controller_1.getSongById);
exports.default = songRouter;
