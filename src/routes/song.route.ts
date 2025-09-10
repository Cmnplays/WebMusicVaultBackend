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
} from "../controllers/song.controller";

songRouter.post("/upload", upload.array("songs", 3), uploadSongs);
songRouter.get("/", getAllSongs);
songRouter.get("/search", searchSong);
songRouter.delete("/:id", deleteSongById);
songRouter.get("/:id", getSongById);

export default songRouter;
