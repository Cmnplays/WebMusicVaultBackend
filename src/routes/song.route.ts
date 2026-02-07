import Router from "express";
import multer from "multer";
const songRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
import {
  uploadSongs,
  getAllSongs,
  getSongById,
  deleteSongById,
  searchSong,
  getRandomSong,
} from "../controllers/song.controller";
const { rateLimit } = require("express-rate-limit");

const uploadLimiter = rateLimit({
  windowMs: 3 * 60 * 60 * 1000,
  max: 10,
  message: "Too many uploads from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

songRouter.post(
  "/upload",
  uploadLimiter,
  upload.array("songs", 3),
  uploadSongs,
);
songRouter.get("/", getAllSongs);
songRouter.get("/rand", getRandomSong);
songRouter.get("/search", searchSong);
songRouter.delete("/:id", deleteSongById);
songRouter.get("/:id", getSongById);

export default songRouter;
