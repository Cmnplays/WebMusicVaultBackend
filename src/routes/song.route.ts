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
} from "../controllers/song.controller";

songRouter.post("/upload", upload.array("songs", 3), uploadSongs);
songRouter.get("/", getAllSongs);
songRouter.get("/:id", getSongById);
songRouter.delete("/:id", deleteSongById);

export default songRouter;
